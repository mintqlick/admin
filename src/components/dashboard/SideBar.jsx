"use client";

import { User, LogOut, Clock, LayoutGrid, icons, LogIn } from "lucide-react";
import Box from "../Box/Box";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { createClient } from "@/utils/supabase/super-base-client";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-toastify";

const navItems = [
  {
    label: "Overview",
    icon: LayoutGrid,
    href: "/dashboard",
    src: "/images/Icons.png",
  },
  {
    label: "Management",
    icon: Clock,
    href: "/dashboard/management",
    src: "/images/icon2.png",
  },
  {
    label: "Help",
    icon: null,
    href: "http://T.me/Nodalcirclessupport",
    src: "/images/telegram.png",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [cleanLoading, setCleanLoading] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/sign-in");
  };

  const CleanUp = async () => {
    setCleanLoading(true);

    const result = await fetch("api/cleaner");
    const values = await result.json();
    setCleanLoading(false);
    toast.success("db cleaned up");
  };

  return (
    <>
      {/* Sidebar for md and up */}
      <Box className="hidden md:flex w-[220px] lg:w-[230px] h-[calc(100vh-100px)] bg-[#EDF2FC] mt-[110px] ml-4 mb-2 flex-col justify-between">
        {/* Top nav */}
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                href={item.href}
                key={item.label}
                className={clsx(
                  "group flex items-center gap-3 px-4 py-2 text-sm lg:text-md font-medium rounded-lg transition relative",
                  {
                    "text-[#1860d9]": isActive,
                    "text-gray-800 hover:text-[#1860d9]": !isActive,
                  }
                )}
              >
                {/* Blue bar on active */}
                {isActive && (
                  <div className="absolute right-0 top-2 bottom-2 w-1 bg-[#1860d9] rounded-r-md" />
                )}
                {item.icon && (
                  <Icon
                    className={clsx(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-[#1860d9]" : "group-hover:text-[#1860d9]"
                    )}
                  />
                )}

                {!item.icon && (
                  <Image
                    src={item.src}
                    alt={item.label}
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                )}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <div className="px-4 pb-4 flex flex-col  gap-16">
          <button
            disabled={cleanLoading}
            onClick={CleanUp}
            className="flex items-center gap-2 text-blue-500 text-sm font-medium hover:bg-blue-100 px-3 py-2 w-full rounded-lg transition disabled:cursor-not-allowed "
          >
            <LogIn className="w-5 h-5" />
            <span>Clean Up</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 text-sm font-medium hover:bg-red-100 px-3 py-2 w-full rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </Box>

      {/* Bottom tab nav for small screens only */}
    </>
  );
}
