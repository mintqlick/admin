"use client";

import { useEffect, useState } from "react";
import { ArrowDown, SearchIcon } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import Spinner from "../ui/spinner";

const pageSize = 10; // number of users per page

const UserSummary = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];

    if (totalPages <= 1) return null;

    pages.push(1);
    const start = Math.max(currentPage, 2);
    const end = Math.min(currentPage + 2, totalPages - 1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return pages.map((num, index) =>
      num === "..." ? (
        <span key={index} className="px-3 text-gray-500">
          ...
        </span>
      ) : (
        <button
          key={index}
          className={`border px-3 py-1 rounded-md ${
            num === currentPage
              ? "border-blue-600 text-blue-600 font-bold"
              : "text-black border-gray-300"
          }`}
          onClick={() => goToPage(Number(num))}
        >
          {num}
        </button>
      )
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };
  useEffect(() => {
    if (search.trim()) return; // Don't run default fetch if searching

    const Executioner = async () => {
      setLoading(true);
      const supabase = createClient();
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const {
        data: users,
        count,
        error,
      } = await supabase
        .from("users")
        .select("*", { count: "exact" })
        .range(from, to);

      const { data: counts, error: errorVal } = await supabase.rpc(
        "user_merge_giver_counts"
      );

      if (error || errorVal || !users || !counts) {
        console.error(error || errorVal);
        setLoading(false);
        return;
      }

      const merged = users.map((user) => {
        const match = counts.find((item) => item.user_id === user.id);
        return { ...user, ...match };
      });

      setUser(merged);
      setTotalPages(Math.ceil((count || 1) / pageSize));
      setLoading(false);
    };

    Executioner();
  }, [currentPage, search]);

  const inputChanged = async (event) => {
    const value = event.target.value;
    setSearch(value);

    if (!value.trim()) {
      setCurrentPage(1); // Reset to first page to reload default list
      return;
    }

    const supabase = createClient();
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value
      );

    setLoading(true);

    try {
      let usersRes;
      if (isUUID) {
        usersRes = await supabase
          .from("users")
          .select("*", { count: "exact" })
          .eq("id", value);
      } else {
        usersRes = await supabase
          .from("users")
          .select("*", { count: "exact" })
          .ilike("name", `%${value}%`);
      }

      const { data: users, count, error } = usersRes;

      const { data: counts, error: errorVal } = await supabase.rpc(
        "user_merge_giver_counts"
      );

      if (error || errorVal || !users || !counts) {
        console.error(error || errorVal);
        setUser([]);
        setLoading(false);
        return;
      }

      const merged = users.map((user) => {
        const match = counts.find((item) => item.user_id === user.id);
        return { ...user, ...match };
      });

      setUser(merged);
      setTotalPages(Math.ceil((count || 1) / pageSize));
    } catch (err) {
      console.error("Unexpected error:", err);
      setUser([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 mt-6">
      <div className="w-full flex justify-between items-center px-4 py-2 rounded-lg">
        <h2 className="text-[#1860D9] font-bold text-3xl">User Summary</h2>
        <span className="w-[60%] flex items-center gap-3 border border-[#98AAC8] rounded-3xl py-3 px-5">
          <SearchIcon size={20} className="text-[#878E99] cursor-pointer" />
          <input
            value={search}
            onChange={inputChanged}
            placeholder="Search Email/name"
            className="w-full placeholder:text-[#878E99] outline-none border-0"
          />
        </span>
        <span className="border border-[#98AAC8] px-7 py-2 text-[12px] font-bold rounded-md cursor-pointer">
          View All
        </span>
      </div>

      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-between items-center px-4 py-2 bg-[#EDF2FC] rounded-lg">
          <span className="text-[#202224] font-bold text-[16px] w-full text-center flex gap-1 items-center justify-center">
            Users <ArrowDown size={20} />
          </span>
          <span className="text-[#202224] font-bold text-[16px] w-full text-center flex gap-1 items-center justify-center">
            UserID <ArrowDown size={20} />
          </span>
          <span className="text-[#202224] font-bold text-[16px] w-full text-center flex gap-1 items-center justify-center">
            Date Joined <ArrowDown size={20} />
          </span>
          <span className="text-[#202224] font-bold text-[16px] w-full text-center flex gap-1 items-center justify-center">
            Total Commitment <ArrowDown size={20} />
          </span>
          <span className="text-[#202224] font-bold text-[16px] w-full text-center">
            Status
          </span>
        </div>

        {loading ? (
          <div className="h-[30rem] w-full flex text-center justify-center">
            <Spinner size={40} />
          </div>
        ) : (
          user.map((user, index) => (
            <Link
              href={`/dashboard/management/${user.id}`}
              key={index}
              className="w-full flex justify-between items-center px-4 py-2 bg-white rounded-lg shadow-sm"
            >
              <span className="text-[#878E99] font-semibold text-[16px] w-full text-center">
                {user.name}
              </span>
              <span className="text-[#878E99] font-semibold text-[16px] w-full text-center">
                {user.id}
              </span>
              <span className="text-[#878E99] font-semibold text-[16px] w-full text-center">
                {formatDate(user.created_at)}
              </span>
              <span className="text-[#878E99] font-semibold text-[16px] w-full text-center">
                {user.giver_count || 0}
              </span>
              <span
                className={`font-semibold text-[16px] w-full text-center ${
                  user.blocked ? "text-red-600" : "text-green-600"
                }`}
              >
                {user.blocked ? "Blocked" : "Successful"}
              </span>
            </Link>
          ))
        )}

        <div className="flex justify-center gap-2">{renderPageNumbers()}</div>
      </div>
    </div>
  );
};

export default UserSummary;
