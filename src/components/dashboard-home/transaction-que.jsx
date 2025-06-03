"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { SearchIcon } from "lucide-react";
import Spinner from "../ui/spinner"; // Adjust if your spinner is elsewhere

const TransactionQue = () => {
  const [txnDataVal, setTxnData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [search, setSearch] = useState("");

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // dd/mm/yyyy
  };

  const renderPageNumbers = () => {
    const pages = [];
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
          onClick={() => goToPage(num)}
        >
          {num}
        </button>
      )
    );
  };

  const SearchValChanged = async (event) => {
    const inputVal = event.target.value;
    setSearch(inputVal);

    // Exit early if input is not a valid UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(inputVal)) {
      setTxnData([]);
      console.error("Invalid UUID format");
      return;
    }

    const supabase = createClient();

    try {
      const { data, count, error } = await supabase
        .from("merge_matches")
        .select("*", { count: "exact" })
        .eq("id", inputVal)
        .order("matched_at", { ascending: true })
        .range(0, 10);

      if (error) {
        console.error("Supabase error:", error.message);
      }

      setTxnData(data || []);
      console.log("Search result:", data);
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, count, error } = await supabase
        .from("merge_matches")
        .select("*", { count: "exact" })
        .order("matched_at", { ascending: true })
        .range(from, to);

      if (!error) {
        setTxnData(data || []);
        setTotalPages(Math.ceil((count || 0) / itemsPerPage));
      }

      setLoading(false);
    };
    if (search === "") {
      fetchData();
    }
  }, [currentPage, search]);

  return (
    <div className="w-full flex flex-col gap-4 mt-6">
      <div className="w-full flex justify-between items-center px-4 py-2 rounded-lg">
        <h2 className="text-[#1860D9] font-bold text-3xl">Transaction Que</h2>
        <span className="w-[75%] flex items-center gap-3 border border-[#98AAC8] rounded-3xl py-3 px-5 ">
          <SearchIcon size={20} className="text-[#878E99] cursor-pointer" />
          <input
            placeholder="Search Email/name"
            value={search}
            onChange={SearchValChanged}
            className="w-full placeholder:text-[#878E99] outline-none border-0"
          />
        </span>
        <span className="border border-[#98AAC8] px-7 py-2 text-[12px] font-bold rounded-md cursor-pointer">
          View All
        </span>
      </div>

      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-between items-center px-4 py-2 bg-[#EDF2FC] rounded-lg">
          <span className="text-[#202224] font-bold text-[16px] w-full text-center">
            Transaction ID
          </span>
          <span className="text-[#202224] font-bold text-[16px] w-full text-center">
            Date and Time
          </span>
          <span className="text-[#202224] font-bold text-[16px] w-full text-center">
            Transaction Type
          </span>
          <span className="text-[#202224] font-bold text-[16px] w-full text-center">
            Amount
          </span>
          <span className="text-[#202224] font-bold text-[16px] w-full text-center">
            Status
          </span>
        </div>

        {loading ? (
          <div className="h-[30rem] w-full flex text-center justify-center">
            <Spinner size={40} />
          </div>
        ) : txnDataVal.length > 0 ? (
          txnDataVal.map((tx, index) => (
            <div
              key={index}
              className="w-full flex justify-between items-center px-4 py-2 bg-white rounded-lg shadow-sm"
            >
              <span className="text-[#878E99] font-semibold text-[16px] w-full text-center">
                {tx.id}
              </span>
              <span className="text-[#878E99] font-semibold text-[16px] w-full text-center">
                {formatDate(tx.matched_at)}
              </span>
              <span className="text-[#878E99] font-semibold text-[16px] w-full text-center">
                commit
              </span>
              <span className="text-[#878E99] font-semibold text-[16px] w-full text-center">
                {tx.matched_amount}
              </span>
              <span
                className={`font-semibold text-[16px] w-full text-center ${
                  tx.status === "completed"
                    ? "text-green-600"
                    : tx.status === "pending"
                      ? "text-yellow-400"
                      : tx.status === "waiting"
                        ? "text-blue-300"
                        : "text-red-600"
                }`}
              >
                {tx.status}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-10">
            No transactions found.
          </div>
        )}

        <div className="flex justify-center gap-2">{renderPageNumbers()}</div>
      </div>
    </div>
  );
};

export default TransactionQue;
