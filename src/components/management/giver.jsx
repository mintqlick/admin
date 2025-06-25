"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import Spinner from "../ui/spinner";
import { createClient } from "@/utils/supabase/client";
import SenderItem from "../dashboard/sender-item";

const ITEMS_PER_PAGE = 4;

const SenderComponent = ({ giveCount, setGiverData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [givers, setGivers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const totalPages = Math.ceil(givers.length / ITEMS_PER_PAGE);

  const paginatedData = givers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCheckboxChange = (id, isChecked, count) => {
    const exists = selectedIds.find((val) => val.id === id);

    const updated = isChecked
      ? exists
        ? selectedIds.map((val) =>
            val.id === id ? { id, amount: count } : val
          )
        : [...selectedIds, { id, amount: count }]
      : selectedIds.filter((val) => val.id !== id);

    setSelectedIds(updated);
    setGiverData(updated);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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

  useEffect(() => {
    const resolver = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("merge_givers")
        .select("*")
        .eq("matched", false)
        .gt("amount_remaining", 0)
        .order("created_at", { ascending: false });

      if (error) {
        console.log(error);
      }
      setGivers(data || []);
      setLoading(false);
      giveCount?.(data?.length || 0);
    };
    resolver();
  }, []);

  return (
    <div className="w-full flex flex-col py-[2rem]">
      <div className="flex justify-between w-full items-center px-4">
        <h2 className="text-black font-bold text-[35px]">Sender's Queue</h2>
        <span className="w-[8rem] border-1 rounded-sm cursor-pointer border-[#98AAC8] flex justify-center items-center py-1 hover:bg-gray-100 hover:text-black">
          Filter <ChevronDown size={20} className="text-[#767680]" />
        </span>
      </div>

      <div className="w-full flex bg-[#EDF2FC] py-6 border-b-[#98AAC8] border-b-2">
        <div className="w-5/12 flex justify-center items-center">
          User Email/ID
        </div>
        <div className="w-3/12 flex justify-center items-center">Amount</div>
        <div className="w-2/12 text-center">Merge Amount</div>
        <div className="w-2/12 justify-center flex items-center">Status</div>
        <div className="w-2/12 justify-center flex items-center">Type</div>
      </div>

      {loading ? (
        <div className="h-[30rem] w-full flex justify-center items-center">
          <Spinner />
        </div>
      ) : (
        paginatedData.map((el) => (
          <SenderItem
            key={el.id}
            item={el}
            isChecked={selectedIds.some((val) => val.id === el.id)}
            onCheckboxChange={handleCheckboxChange}
          />
        ))
      )}

      {/* Pagination */}
      {!loading && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md bg-gray-300 disabled:opacity-50"
          >
            <ChevronLeft size={18} />
          </button>

          {renderPageNumbers()}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md bg-gray-300 disabled:opacity-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Optional: Show selected IDs */}
      {/* <div className="text-sm text-gray-600 mt-4">
        Selected IDs: {selectedIds.join(", ")}
      </div> */}
    </div>
  );
};

export default SenderComponent;
