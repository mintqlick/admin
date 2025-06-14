"use client";

import Box from "@/components/Box/Box";
import SendersComponent from "@/components/management/giver";
import ReceiverComponent from "@/components/management/receiver";
import { createClient } from "@/utils/supabase/client";
import { Check, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

const DashBoardPage = () => {
  let [receiver_count, setReceiverCount] = useState(0);
  let [giver_count, setGiverCount] = useState(0);
  const [receiver, setReceiver] = useState(null);
  const [giver, setGiver] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [merged, setMerged] = useState(false);

  const giverCount = (val) => {
    setGiverCount(val);
  };

  const receiverCount = (val) => {
    setReceiverCount(val);
  };

  const setReceiverData = (data) => {
    console.log(data);
    setReceiver(data);
  };

  const setGiverData = (data, val) => {
    console.log(data, val);
    setGiver(data);
  };

  const showModalHandler = () => {
    setShowModal(true);
  };
  const refreshPage = () => {
    window.location.reload();
  };

  const MergeUs = async () => {
    setLoading(true);
    const supabase = createClient();

    // STEP 1: Fetch receiver's data first
    const { data: rcvData, error: rcvErr } = await supabase
      .from("merge_receivers")
      .select("amount_remaining")
      .eq("id", receiver)
      .eq("matched", false)
      .single();

    if (rcvErr || !rcvData) {
      console.error("Failed to fetch receiver data:", rcvErr?.message);
      toast.error("Failed to fetch receiver information");
      setLoading(false);
      return;
    }

    let receiverRemaining = rcvData.amount_remaining;

    for (const element of giver || []) {
      if (!element) {
        console.warn("Skipping invalid giver:", element);
        continue;
      }

      // STEP 2: Get the giver's actual remaining amount
      const { data: giverData, error: fetchErr } = await supabase
        .from("merge_givers")
        .select("amount_remaining")
        .eq("id", element.id)
        .eq("matched", false)
        .single();

      if (fetchErr || !giverData) {
        console.error("Failed to fetch giver:", fetchErr?.message);
        continue;
      }

      const giverAmount = element.amount;
      const giverRemaining = giverData.amount_remaining;

      // STEP 3: Check if giver's amount fits into receiver
      if (giverAmount > receiverRemaining) {
        toast.warning(
          `Giver amount (${giverAmount}) exceeds receiver remaining amount (${receiverRemaining}). Skipping.`
        );
        continue;
      }

      if (giverRemaining < giverAmount) {
        console.warn("Insufficient giver amount:", element);
        continue;
      }

      // STEP 4: Update giver
      const { error: giverUpdateErr } = await supabase
        .from("merge_givers")
        .update({
          matched: giverRemaining - giverAmount === 0,
          amount_remaining: giverRemaining - giverAmount,
          confirmed: true,
        })
        .eq("id", element.id);

      if (giverUpdateErr) {
        console.error("Failed to update giver:", giverUpdateErr.message);
        continue;
      }

      // STEP 5: Update receiver
      receiverRemaining -= giverAmount;

      const { error: receiverUpdateErr } = await supabase
        .from("merge_receivers")
        .update({
          matched: receiverRemaining === 0,
          confirmed: true,
          touched: true,
          status: receiverRemaining === 0 ? "pending" : undefined,
          amount_remaining: receiverRemaining,
        })
        .eq("id", receiver);

      if (receiverUpdateErr) {
        console.error("Failed to update receiver:", receiverUpdateErr.message);
        continue;
      }

      // STEP 6: Insert merge match
      const { error: matchErr } = await supabase.from("merge_matches").insert({
        giver_id: element.id,
        receiver_id: receiver,
        matched_amount: giverAmount,
      });

      if (matchErr) {
        console.error("Failed to insert match:", matchErr.message);
      }
    }

    setMerged(true);
    setLoading(false);
  };

  const totalAmt = Array.isArray(giver)
    ? giver.reduce((sum, el) => sum + parseFloat(el.amount), 0)
    : 0;

  return (
    <div className="w-full flex flex-col relative">
      <div className="w-full flex justify-center gap-6">
        <Box className="w-full flex bg-[#EDF2FC] justify-between items-center">
          <div className="flex flex-col ">
            <span className=" text-[#202224] text-[18px] font-semibold">
              Total Users Awaiting Matching
            </span>
            <span className="text-[35px] font-semibold text-[#202224]">
              {giver_count}
            </span>
          </div>
          <div className="rounded-full bg-blue-200 h-[60px] w-[60px] flex justify-center items-center ">
            <Users size={45} className="h-6 w-6 text-[#1860D9]" />
          </div>
        </Box>
        <Box className="w-full flex bg-[#EDF2FC] justify-between items-center">
          <div className="flex flex-col ">
            <span className=" text-gray-600 text-[18px] font-semibold">
              Total Users Ready to receive
            </span>
            <span className="text-[35px] font-semibold">{receiver_count}</span>
          </div>
          <div className="rounded-full bg-blue-100 h-[60px] w-[60px] flex justify-center items-center ">
            <Users size={45} className="h-6 w-6 text-[#BACFF4]" />
          </div>
        </Box>
      </div>
      <SendersComponent giveCount={giverCount} setGiverData={setGiverData} />

      <ReceiverComponent
        receiverCount={receiverCount}
        setReceiverData={setReceiverData}
      />
      {showModal && (
        <div className="w-full h-[100vh] bg-gray-700 flex justify-center items-center fixed left-0 ">
          <div className="bg-[#EDF2FC] w-[30%] h-[30rem] rounded-xl flex justify-center items-center flex-col">
            {!merged && (
              <span className="text-center w-[90%] text-[35px] font-semibold flex flex-col justify-center items-center">
                <span className="text-[75px] rounded-full w-[8rem] py-1  bg-[#1860D9] text-white font-bold">
                  ?
                </span>
                <span className="w-[80%]">
                  You about to merge{" "}
                  <span className="font-bold">({receiver.split("-")[0]})</span>{" "}
                  to receive {totalAmt}  USDT 
                </span>
                <div className="flex w-full justify-between h-[4rem] mt-7">
                  <button
                    className="text-[15px] border-dashed border-2 border-[#98AAC8] px-[5rem] text-[#05132B] h-full rounded-4xl cursor-pointer"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    disabled={loading}
                    onClick={MergeUs}
                    className="bg-[#1860D9] text-[15px]  px-[5rem] font-bold h-full rounded-4xl text-white cursor-pointer disabled:bg-blue-400"
                  >
                    Confirm
                  </button>
                </div>
              </span>
            )}

            {merged && (
              <span className="w-full flex justify-center items-center flex-col">
                <span className="text-[75px] rounded-full w-[8rem] py-6 flex justify-center bg-[#1860D9] text-white font-bold">
                  <Check size={70} color="white" className="stroke-[4]" />
                </span>
                <span className="font-bold w-[80%] text-center text-[40px] text-[#05132B] ">
                  Successfully merged <br />
                  {giver.length} <span>to</span> 1
                </span>
                <button
                  onClick={refreshPage}
                  className="bg-[#1860D9] text-[15px]  px-[10rem] py-5 font-bold h-full rounded-4xl text-white cursor-pointer"
                >
                  Back to Management
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      <div className="w-full flex justify-center items-center">
        <span
          onClick={showModalHandler}
          className="bg-[#1860D9] w-[20rem]  font-bold text-white rounded-4xl flex justify-center items-center py-5 cursor-pointer"
        >
          Merge
        </span>
      </div>
    </div>
  );
};

export default DashBoardPage;
