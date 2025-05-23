"use client";

import { EyeIcon, EyeOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";

const HomePage = () => {
  const [show, setShow] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const switchPass = () => setShow((prev) => !prev);

  const submitHandler = async (data) => {
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="w-full relative flex flex-col justify-center items-center h-screen">
      <div className="absolute w-full top-0 z-10 h-screen">
        <Image
          src={"/images/Verification.png"}
          height={3080}
          width={3000}
          className=" w-full h-screen"
        />
      </div>
      <div className="w-[45%] xl:w-[50%] 2xl:w-[40%] flex flex-col bg-[#EDF2FC] rounded-2xl py-12 relative z-20 px-8 gap-4 max-w-[45rem]">
        <h2 className="flex justify-center items-center font-bold w-full text-[#05132B] text-bold text-[30px]">
          Admin Login
        </h2>
        <form
          className="w-full flex flex-col justify-center gap-7"
          onSubmit={handleSubmit(submitHandler)}
        >
          <div className="w-full flex bg-white border-2 border-[#98AAC8] py-3 text-[18px] rounded-md px-4">
            <input
              {...register("email", { required: true })}
              className="w-full outline-none"
              placeholder="Username/Email"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm -mt-5">Email is required</p>
          )}

          <div className="w-full flex bg-white border-2 border-[#98AAC8] py-3 text-[18px] rounded-md px-4">
            <input
              {...register("password", { required: true })}
              className="w-full outline-none"
              placeholder="Password"
              type={show ? "text" : "password"}
            />
            {show ? (
              <EyeIcon className="cursor-pointer" onClick={switchPass} />
            ) : (
              <EyeOff className="cursor-pointer" onClick={switchPass} />
            )}
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm -mt-5">Password is required</p>
          )}

          <div className="w-full flex bg-[#1860D9] py-3 text-[18px] rounded-3xl px-4">
            <button
              type="submit"
              className="w-full text-white font-bold text-[20px] cursor-pointer"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HomePage;
