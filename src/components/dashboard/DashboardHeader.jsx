"use client";

import { Bell } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
// import Notification from "./Notification";

export default function DashboardHeader() {
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null); // State to hold user ID

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
      } else {
        setUserId(user?.id);
        const { data: userData, error: userDataError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user?.id)
          .single();
        if (userDataError) {
          console.error("Error fetching user data:", userDataError.message);
        } else {
          const { data: accountData, error: accountError } = await supabase
            .from("account")
            .select("*")
            .eq("user_id", user?.id)
            .limit(1)
            .maybeSingle();
          if (accountError) {
            console.error("Error fetching account data:", accountError.message);
          } else {
            console.log("Account data:", accountData);
            setUserData({ ...userData, account: accountData });
          }
        }
        console.log("User data: here", userData);
      }
    };
    fetchUserData();
  }, []);
  return (
    <header className="fixed top-0 left-0 z-50 w-full flex justify-center pointer-events-none">
      <div className="w-full max-w-[95%] mt-4 mx-4 rounded-2xl bg-[#EDF2FC] shadow-md h-[70px] px-8 md:px-6 flex items-center justify-between pointer-events-auto">
        {/* Logo Section */}
        <div className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={1080}
            height={1090}
            className="w-[150px] md:w-[250px] md:h-[200px] lg:w-[200px] lg:h-[200px] object-contain"
          />
        </div>

        {/* Right Side (Notification + User) */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Notification Bell */}
          {/* <Notification /> */}
          {/* <div className="relative bg-white p-2 rounded-full shadow-md">
            <Bell  className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] md:text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {}
            </span>
          </div> */}

          {/* Username + Avatar */}
          <div className="flex items-center gap-2">
            {/* Username hidden on small screens */}
            <span className="hidden sm:inline text-xs md:text-sm font-medium text-gray-800">
              {userData?.name || "Admin"}
            </span>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xs md:text-sm font-bold text-white">
                {userData?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "?"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
