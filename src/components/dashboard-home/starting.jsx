"use client";

import { ArrowDown, ArrowUp, BoxIcon, UsersIcon } from "lucide-react";
import Box from "../Box/Box";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import PieStats from "./pie";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import Spinner from "../ui/spinner";

const StartingDashboard = () => {
  const data = [
    { name: "Mon", users: 800 },
    { name: "Tue", users: 100 },
    { name: "Wed", users: 2450 },
    { name: "Thu", users: 970 },
    { name: "Fri", users: 480 },
  ];

  const [dataVal, setData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [giverQueLoadinv, setgiverQueLoading] = useState(true);
  const [giverQueArr, setGiverQueArr] = useState([]);
  const [giverCount, setGiverCount] = useState(0);
  const [receiverQueArr, setReceiverQueArr] = useState([]);
  const [receiverQueLoading, setReceiverQueLoading] = useState(true);
  const [receiverCount, setReceiverCount] = useState(0);
  const [activeUserArr, setAciveUserArr] = useState([]);
  const [activeUserLoading, setActiveUserLoading] = useState(true);
  const [activeUserCount, setActiveUserCount] = useState();

  useEffect(() => {
    const fetchWeeklyData = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("weekly_user_signups");

      if (error) {
        console.error("Error fetching data:", error.message);
      } else {
        const formatted = data.map((d) => ({
          ...d,
          week: new Date(d.week).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
        }));
        setData(formatted);
      }

      setLoading(false);
    };

    fetchWeeklyData();
  }, []);

  useEffect(() => {
    async function getTotalUsers() {
      const supabase = createClient();
      const { count, error } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error("Error getting total users:", error.message);
        return 0;
      }
      console.log("Total users count:", count);

      setTotalUsers(count);
    }
    getTotalUsers();
  }, []);

  useEffect(() => {
    const fetchUncompletedMerges = async () => {
      const supabase = createClient();
      setgiverQueLoading(true);
      const { data, error } = await supabase.rpc("weekly_uncompleted_merges");

      if (error) {
        console.error("Error fetching weekly merge data:", error.message);
      } else {
        // Optional: format date if needed
        const formatted = data.map((item) => ({
          ...item,
          week_start: new Date(item.week_start).toISOString().split("T")[0], // "YYYY-MM-DD"
        }));
        setGiverQueArr(formatted);
      }

      setgiverQueLoading(false);
    };

    fetchUncompletedMerges();
  }, []);
  useEffect(() => {
    async function getTotalUsers() {
      const supabase = createClient();
      const { count, error } = await supabase
        .from("merge_givers")
        .select("*", { count: "exact", head: true })
        .neq("status", "completed");

      if (error) {
        console.error("Error getting total users:", error.message);
        return 0;
      }

      setGiverCount(count);
    }
    getTotalUsers();
  }, []);

  useEffect(() => {
    const fetchUncompletedMerges = async () => {
      const supabase = createClient();
      setReceiverQueLoading(true);
      const { data, error } = await supabase.from("merge_receivers")
      .eq();

      if (error) {
        console.error("Error fetching weekly merge data:", error.message);
      } else {
        // Optional: format date if needed
        const formatted = data.map((item) => ({
          ...item,
          week_start: new Date(item.week_start).toISOString().split("T")[0], // "YYYY-MM-DD"
        }));
        setReceiverQueArr(formatted);
      }

      setReceiverQueLoading(false);
    };

    fetchUncompletedMerges();
  }, []);

  useEffect(() => {
    async function getTotalUsers() {
      const supabase = createClient();
      const { count, error } = await supabase
        .from("merge_receviers")
        .select("*", { count: "exact", head: true })
        .neq("status", "completed");
      console.log(count, error);

      if (error) {
        console.error("Error getting total users:", error.message);
        return 0;
      }

      setReceiverCount(count);
    }
    getTotalUsers();
  }, []);

  useEffect(() => {
    const fetchActiveUsers = async () => {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("weekly_active_users") // using the view
        .select("*");

      if (error) {
        console.error("Error fetching active users:", error.message);
      } else {
        // Format data if needed
        const formatted = data.map((item) => ({
          date: new Date(item.day).toLocaleDateString(),
          count: item.count,
        }));
        setAciveUserArr(formatted);
      }

      setActiveUserLoading(false);
    };

    fetchActiveUsers();
  }, []);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);

  useEffect(() => {
    const functionExec = async () => {
      const supabase = createClient();
      const { count, error } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .gte("last_sign_in_at", sevenDaysAgo.toISOString()); // ISO string in UTC
      setActiveUserCount(count);
    };
    functionExec();
  }, []);

  return (
    <div className="flex w-full gap-1 h-[31rem]">
      <div className="w-[70%] flex flex-wrap bg-white gap-3">
        <Box className="bg-[#EDF2FC] w-[31%] px-4 h-[15rem] flex flex-col justify-around items-start">
          <div className="flex justify-between w-full">
            <span className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold text-[#878E99]">
                Total User
              </h2>
              <h2 className="text-2xl font-bold text-[#202224]">
                {totalUsers || "N/A"}
              </h2>
            </span>
            <span className="w-16 h-16 rounded-full bg-blue-300 flex justify-center items-center">
              <UsersIcon size={30} className="text-[#1860D9]" />
            </span>
          </div>

          {loading ? (
            <Spinner size={30} />
          ) : (
            <div className="w-full flex">
              <ResponsiveContainer width="50%" height={30}>
                <LineChart data={dataVal}>
                  <Line
                    type="monotone"
                    dataKey="user_count"
                    stroke="#1B4AF0"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <span className="text-sm text-[#606060] mt-2">
                +8.5% from last week
              </span>
            </div>
          )}
        </Box>
        <Box className="bg-[#EDF2FC] w-[31%] px-4 h-[15rem] flex flex-col justify-around items-start">
          <div className="flex justify-between w-full">
            <span className="flex flex-col gap-1">
              <h2 className="text-sm font-bold text-[#878E99] w-[80%]">
                Total Users to receive in queue
              </h2>
              <h2 className="text-2xl font-bold text-[#202224]">
                {receiverCount ? receiverCount : 0}
              </h2>
            </span>
            <span className="w-16 h-16 rounded-full bg-[#D7C509] flex justify-center items-center opacity-60">
              <BoxIcon size={40} className="text-[#EDF2FC] stroke-2" />
            </span>
          </div>

          {receiverQueLoading && (
            <div className="w-full flex gap-2">
              <ResponsiveContainer width="30%" height={30}>
                <LineChart data={receiverQueArr}>
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#1B4AF0"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <span className="text-sm text-[#606060] mt-2">
                +8.5% Up from past week
              </span>
            </div>
          )}
        </Box>
        <Box className="bg-[#EDF2FC] w-[31%] px-4 h-[15rem] flex flex-col justify-around items-start">
          <div className="flex justify-between w-full">
            <span className="flex flex-col gap-1">
              <h2 className="text-sm font-bold text-[#878E99] w-[80%]">
                Total Users to commit in queue
              </h2>
              <h2 className="text-2xl font-bold text-[#202224]">
                {giverCount || "N/A"}
              </h2>
            </span>
            <span className="w-16 h-16 rounded-full bg-[#BACFF4] flex justify-center items-center">
              <BoxIcon size={40} className="text-blue-200 stroke-2" />
            </span>
          </div>

          {giverQueLoadinv && (
            <div className="w-full flex">
              <ResponsiveContainer width="50%" height={30}>
                <LineChart data={giverQueArr}>
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#1B4AF0"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <span className="text-sm text-[#606060] mt-2">
                +8.5% from last week
              </span>
            </div>
          )}
        </Box>
        <Box className="bg-[#EDF2FC] w-[47%] px-4 h-[15rem] flex justify-between items-center">
          <div className="flex justify-between w-full ">
            <span className="flex flex-col-reverse gap-1 w-full">
              <h2 className="text-sm font-bold text-[#878E99] w-[80%]">
                Active Users
              </h2>
              <h2 className="text-2xl font-bold flex justify-between w-[80%] text-[#202224]">
                {activeUserCount || 0}
                <span className="flex items-center text-green-600 text-[12px] justify-center">
                  1.5% <ArrowUp size={13} />
                </span>
              </h2>
            </span>
          </div>

          {activeUserLoading && (
            <div className="w-full flex justify-end items-end">
              <ResponsiveContainer width="50%" height={30}>
                <LineChart data={activeUserArr}>
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#1B4AF0"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Box>
        <Box className="bg-[#EDF2FC] w-[47%] px-4 h-[15rem] flex justify-between items-center">
          <div className="flex justify-between w-full ">
            <span className="flex flex-col-reverse gap-1 w-full">
              <h2 className="text-sm font-bold text-[#878E99] w-[80%]">
                Inactive Users
              </h2>
              <h2 className="text-2xl font-bold flex justify-between w-[80%] text-[#202224]">
                20
                <span className="flex items-center text-red-600 text-[12px] justify-center">
                  1.5% <ArrowDown size={13} />
                </span>
              </h2>
            </span>
          </div>

          <div className="w-full flex justify-end items-end">
            <ResponsiveContainer width="50%" height={30}>
              <LineChart data={data}>
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#1B4AF0"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Box>
      </div>
      <div className="w-[30%] bg-white h-full rounded-xl flex justify-center ">
        <Box className="bg-[#EDF2FC] w-full px-4 h-full flex flex-col items-center py-8">
          <h2 className="text-3xl font-bold text-[#202224]">User Tracking</h2>
          <PieStats />
        </Box>
      </div>
    </div>
  );
};

export default StartingDashboard;
