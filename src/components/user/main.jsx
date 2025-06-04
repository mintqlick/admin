"use client";

import { Dot, SearchIcon } from "lucide-react";
import Box from "../Box/Box";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Spinner from "../ui/spinner";
import { toast } from "react-toastify";

const transactions = [
  {
    id: "TXN123456",
    date: "2024-05-29 10:00 AM",
    type: "Commitment",
    amount: "10 USD",
    status: "completed",
  },
  {
    id: "TXN123457",
    date: "2024-05-28 02:30 PM",
    type: "Recommitment",
    amount: "15 USD",
    status: "pending",
  },
  {
    id: "TXN123458",
    date: "2024-05-27 08:15 PM",
    type: "Donation",
    amount: "20 USD",
    status: "completed",
  },
  {
    id: "TXN123459",
    date: "2024-05-26 11:45 AM",
    type: "Pledge",
    amount: "5 USD",
    status: "failed",
  },
  {
    id: "TXN123460",
    date: "2024-05-25 04:00 PM",
    type: "Commitment",
    amount: "10 USD",
    status: "completed",
  },
  {
    id: "TXN123461",
    date: "2024-05-24 01:30 PM",
    type: "Recommitment",
    amount: "15 USD",
    status: "pending",
  },
  {
    id: "TXN123462",
    date: "2024-05-23 09:00 AM",
    type: "Donation",
    amount: "25 USD",
    status: "completed",
  },
];

const UsersPage = ({ id }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [userAcc, setUserAcc] = useState();
  const [userAccLoading, setUserAccLoading] = useState(true);
  const [userAccount, setUserAccount] = useState([]);
  const [userAccountLoading, setUserAccountLoading] = useState(true);
  const [blockAccLoading, setBlockAccLoading] = useState(false);

  const [updateLoading, setUpdateLoading] = useState(false);

  const [dataVal, setDataVal] = useState([]);

  const totalPages = Math.ceil(dataVal.length / itemsPerPage);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const paginatedTransactions = dataVal.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const fetcher = async () => {
      setUserAccLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      setUserAccLoading(false);

      setUserAcc(data);
    };

    fetcher();
  }, [id]);

  useEffect(() => {
    const fetcher = async () => {
      setUserAccountLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("account")
        .select("*")
        .eq("user_id", id)
        .single();

      console.log(error);
      setUserAccountLoading(false);
      if (data) {
        const address = data.address.split(",");
        const network = data.network.split(",");
        const merge = address.map((el, i) => {
          return { address: el, network: network[i] };
        });
        setUserAccount(merge);
      } else {
        setUserAccount([]);
      }
      setUserAccLoading(false);
    };

    fetcher();
  }, [id]);

  useEffect(() => {
    const executioner = async () => {
      const supabase = createClient();
      const { data: giverVal, error: gvrErr } = await supabase
        .from("merge_givers")
        .select("*")
        .eq("user_id", id);

      const { data: receiverVal, error: rcvErr } = await supabase
        .from("merge_receivers")
        .select("*")
        .eq("user_id", id);

      if (gvrErr || rcvErr) {
        console.error("Error fetching merge data", gvrErr || rcvErr);
        return null;
      }
      const dataRes = [...giverVal, ...receiverVal];
      setDataVal(dataRes);
    };

    executioner();
  }, [id]);

  const AllowUpdate = async () => {
    setUpdateLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("account")
      .update({ updated: false })
      .eq("user_id", id);
    setUpdateLoading(false);
    toast.success("user can now update account");
  };

  const BlockAcc = async () => {
    setBlockAccLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("users")
      .update({ blocked: !userAcc.blocked })
      .eq("id", id);
    if (error) {
      console.log(error);
      toast.error(error.message);
    }
    setBlockAccLoading(false);
    toast.success(`user ${userAcc.blocked ? "unblocked" : "blocked"}`);
    window.location.reload();
  };

  

  const filtered =
    dataVal &&
    dataVal.filter((el) => {
      return  el.confirmed === true && el.status === "waiting"||el.status === "pending";
    });

    console.log(filtered)

  return (
    <div className="w-full flex gap-4">
      {/* Left Section */}
      <div className="flex flex-col w-2/6 gap-4">
        {/* User Info */}
        <Box className="w-full bg-[#EDF2FC] flex items-center justify-center flex-col">
          {userAccLoading && (
            <div className="h-[30rem] flex justify-center items-center">
              <Spinner size={35} />
            </div>
          )}
          {userAcc && (
            <div className="w-full flex  items-center">
              <span className="text-3xl text-white flex justify-center items-center w-[6rem] h-[6rem] rounded-full bg-[#05132B] font-semibold">
                {userAcc?.name.split(" ")[0][0] +
                  "" +
                  userAcc?.name.split(" ")[1][0]}
              </span>
              <span className="text-2xl font-bold text-[#05132B] ml-4">
                <h2 className="text-3xl font-bold">{userAcc.name}</h2>
                <p className="text-lg text-[#878E99] font-semibold">
                  Contribution ID: {userAcc.id.split("-")[0]}
                </p>
              </span>
            </div>
          )}
          {console.log(userAcc)}
          {/* User Information */}
          {userAcc && (
            <div className="w-full mt-4 text-gray-600">
              <p className="text-[#1860D9] text-3xl font-semibold">
                User&apos;s Information
              </p>
              <p className="text-lg flex justify-between items-center mt-2">
                <span className="text-[#05132B] font-bold text-[15px]">
                  Fullname:
                </span>
                <span className="text-[#878E99] text-[15px] font-semibold">
                  {userAcc.name}
                </span>
              </p>
              <p className="text-lg flex justify-between items-center mt-2">
                <span className="text-[#05132B] font-bold text-[15px]">
                  Nickname:
                </span>
                <span className="text-[#878E99] text-[15px] font-semibold">
                  {userAcc.nickname || "N/A"}
                </span>
              </p>
              <p className="text-lg flex justify-between items-center mt-2">
                <span className="text-[#05132B] font-bold text-[15px]">
                  Gender:
                </span>
                <span className="text-[#878E99] text-[15px] font-semibold">
                  {userAcc.gender || "N/A"}
                </span>
              </p>
              <p className="text-lg flex justify-between items-center mt-2">
                <span className="text-[#05132B] font-bold text-[15px]">
                  Country:
                </span>
                <span className="text-[#878E99] text-[15px] font-semibold">
                  {userAcc.country || "N/A"}
                </span>
              </p>
            </div>
          )}

          {/* Contact Info */}
          {userAcc && (
            <div className="w-full mt-6 text-gray-600">
              <p className="text-[#878E99] text-xl font-semibold my-5">
                Contact Information
              </p>
              <p className="text-lg flex justify-between items-center mt-2">
                <span className="text-[#05132B] font-bold text-[15px]">
                  Email:
                </span>
                <span className="text-[#878E99] text-[15px] font-semibold">
                  {userAcc.email || "N/A"}
                </span>
              </p>
              <p className="text-lg flex justify-between items-center mt-2">
                <span className="text-[#05132B] font-bold text-[15px]">
                  Phone Number:
                </span>
                <span className="text-[#878E99] text-[15px] font-semibold">
                  {userAcc.phone || "N/A"}
                </span>
              </p>
              <p className="text-lg flex justify-between items-center mt-2">
                <span className="text-[#05132B] font-bold text-[15px]">
                  Telegram Handle
                </span>
                <span className="text-[#878E99] text-[15px] font-semibold">
                  {userAcc.telegram || "N/A"}
                </span>
              </p>
            </div>
          )}
        </Box>

        {/* Wallet Details */}
        <Box className="w-full bg-[#EDF2FC] flex items-center justify-center flex-col">
          <div className="w-full">
            <h2 className="text-3xl font-semibold text-[#1860D9]">
              Wallet Details
            </h2>
            <p className="text-[13px] text-[#878E99] font-semibold">
              These are all wallet address attached
            </p>
          </div>

          {userAccountLoading && (
            <div className="h-[25rem] flex justify-center items-center">
              <Spinner size={35} />
            </div>
          )}

          {!userAccountLoading && !(userAccount.length > 0) && (
            <div className="h-[25rem] flex justify-center items-center text-[#767680] text-[18px]">
              No account info
            </div>
          )}

          {userAccount &&
            userAccount.map((el, index) => (
              <div key={index} className="w-full mt-4 text-gray-600">
                <div className="text-lg flex justify-between items-center">
                  <div className="text-[#878E99] font-semibold text-[15px]">
                    <h2>Crypto Network</h2>
                    <h2>{el.network}</h2>
                  </div>
                  <div className="text-[#878E99] text-[15px] font-semibold">
                    <h2>Wallet Address</h2>
                    <h2>{el.address}</h2>
                  </div>
                </div>
              </div>
            ))}
        </Box>

        {/* Account Control */}
        <Box className="w-full bg-[#EDF2FC] flex items-center justify-center flex-col">
          <h2 className="w-[60%] text-[#1860D9] text-2xl font-bold text-center">
            Account Control
          </h2>
          <h2 className="w-[90%] text-[#767680] text-[15px] text-center">
            Manage user accounts with ease. Block, Modify access and permissions
            instantly
          </h2>
          <div className="w-[90%] flex flex-row-reverse justify-between items-center mt-4 gap-3">
            <button
              disabled={blockAccLoading}
              onClick={BlockAcc}
              className="bg-[#1860D9] text-white w-[50%] py-2 rounded-3xl font-semibold cursor-pointer disabled:cursor-pointer"
            >
              {userAcc?.blocked ? "UnBlock" : "Block"}
            </button>
            <button
              onClick={AllowUpdate}
              disabled={updateLoading}
              className="bg-[white] cursor-pointer text-[#878E99] w-[50%] py-2 rounded-3xl font-semibold disabled:bg-[#BACFF4] hover:bg-[#BACFF4] hover:text-[#05132B] disabled:text-[#05132B]"
            >
              Allow update
            </button>
          </div>
        </Box>
      </div>

      {/* Right Section */}
      <div className="flex flex-col w-4/6 gap-4">
        {/* State of Account */}
        <Box className="w-full bg-[#EDF2FC] flex items-center justify-center flex-col">
          <h2 className="text-[#1860D9] text-3xl font-semibold w-full text-start">
            State of Account
          </h2>
          <div className="w-full flex flex-col mt-7">
            <div className="flex justify-between items-center w-full">
              <span className="w-full font-semibold text-[#05132B]">
                Commitment
              </span>

              {console.log(filtered)}
              <span className="w-full font-semibold text-[#05132B] text-center">
                {filtered.length > 0 ? filtered[0].original_amount : "N/A"} USD
              </span>
              <span className="w-full text-green-600 font-semibold flex justify-end items-center">
                <span className="w-auto bg-[#DFF6E4] px-3 py-1 text-[#05132B] font-semibold flex items-center gap-1">
                  <Dot size={22} className="text-green-600" /> Currently Active
                </span>
              </span>
            </div>
            <div className="flex justify-between items-center w-full mt-4">
              <span className="w-full font-semibold text-[#05132B]">
                Recommitment
              </span>
              <span className="w-full font-semibold text-[#05132B] text-center">
                {filtered.length > 1 ? filtered[0].original_amount : "N/A"} USD
              </span>
              <span className="w-full flex justify-end items-center">
                <span className="w-auto bg-[#FFF1BA] px-3 py-1 text-[#6E5801] font-semibold flex items-center gap-1">
                  <Dot size={22} /> Not active
                </span>
              </span>
            </div>
          </div>
        </Box>

        {/* Transaction Queue with Pagination */}
        <Box className="w-full bg-[#EDF2FC] flex items-center justify-center flex-col">
          <div className="w-full flex justify-between items-center py-2 rounded-lg">
            <h2 className="text-[#1860D9] font-bold text-3xl">
              Transaction Que
            </h2>
            <span className="w-[55%] flex items-center gap-3 border border-[#98AAC8] rounded-3xl py-3 px-5 ">
              <SearchIcon size={20} className="text-[#878E99] cursor-pointer" />
              <input
                placeholder="Search Email/name"
                className="w-full placeholder:text-[#878E99] outline-none border-0 bg-transparent"
              />
            </span>
            <span className="border border-[#98AAC8] px-7 py-2 text-[12px] font-bold rounded-md cursor-pointer">
              View All
            </span>
          </div>

          {/* Table Header */}
          <div className="w-full flex flex-col mt-7">
            <div className="flex justify-between items-center w-full font-bold text-[#05132B] border-b-2 border-[#98AAC8] pb-3">
              <span className="w-full text-center">Transaction ID</span>
              <span className="w-full text-center">Date and Time</span>
              <span className="w-full text-center">Transaction Type</span>
              <span className="w-full text-center">Amount</span>
              <span className="w-full text-center">Status</span>
            </div>

            {/* Paginated Transactions */}
            {paginatedTransactions.map((txn, index) => (
              <div
                key={index}
                className="flex justify-between items-center w-full mt-2 text-[#05132B] font-medium text-sm  border-b-2 border-[#98AAC8] pb-3 py-5"
              >
                <span className="w-full text-center">{txn.id}</span>
                <span className="w-full text-center">
                  {formatDate(txn.created_at)}
                </span>
                <span className="w-full text-center">commit</span>
                <span className="w-full text-center">
                  {txn.original_amount}
                </span>
                <span
                  className={`w-full text-center ${txn.status === "completed" ? "text-green-500" : txn.status === "pending" ? "text-yellow-300" : txn.status === "waiting" ? "text-blue-400" : "text-red-400"}`}
                >
                  {txn.status}
                </span>
              </div>
            ))}

            {/* Pagination Controls */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-4 py-2 border rounded ${currentPage === i + 1 ? "bg-[#1860D9] text-white" : ""}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </Box>
      </div>
    </div>
  );
};

export default UsersPage;
