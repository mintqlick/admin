"use client";

import { signInAction } from "@/action/auth-actions";
import { Check, EyeIcon, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const HomePage = () => {
  const [show, setShow] = useState(false);
  const [showcode, setShowCode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [values, setValues] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [code_loading, setCodeLoading] = useState(false);

  const {
    register: codeRgst,
    handleSubmit: codeSubmit,
    formState: { errors: codeErr },
  } = useForm();
  const router = useRouter();

  const switchPass = () => setShow((prev) => !prev);

  const submitHandler = async (data) => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!result.success) {
        toast.warning(result.message);
        setLoading(false);
        return;
      }
      setShowCode(true);
      setLoading(false);
      setValues({ email: data.email, password: data.password });
    } catch (error) {
      toast.warning(error.message);
      setLoading(false);
    }
  };

  const CodeValidator = async (data) => {
    setCodeLoading(true);
    try {
      const payload = { ...values, code: data.code };
      const response = await fetch("/api/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!result.success) {
        toast.warning(result.message);
        setCodeLoading(false);
        return;
      }
      const resultVal = await signInAction({
        email: payload?.email,
        password: payload?.password,
      });

      if (resultVal?.error) {
        console.log("here");
        toast.warning(resultVal.message);
        if (resultVal.message === "Invalid login credentials") {
          setShowCode(false);
        }
        setCodeLoading(false);
        return;
      }
      setShowSuccess(true);
      setCodeLoading(false);
    } catch (error) {
      toast.warning(error.message);
      setCodeLoading(false);
    }
  };

  const goToAdmin = () => {
    router.push("/dashboard");
  };

  return (
    <div className="w-full relative flex flex-col justify-center items-center h-screen">
      <div className="absolute w-full top-0 z-10 h-[100%]">
        <Image
          src={"/images/Verification.png"}
          height={1080}
          width={1000}
          className="object-cover w-full h-[full]"
        />
      </div>
      <div className="w-[45%] xl:w-[50%] 2xl:w-[40%] flex flex-col bg-[#EDF2FC] rounded-2xl py-12 relative z-20 px-8 gap-4 max-w-[45rem]  top-[10%]">
        {!showcode && !showSuccess && (
          <>
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
                <p className="text-red-500 text-sm -mt-5">
                  Password is required
                </p>
              )}

              <div
                className={`w-full flex ${loading ? "bg-blue-400" : "bg-[#1860D9]"} py-3 text-[18px] rounded-3xl px-4`}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white font-bold text-[20px] cursor-pointer"
                >
                  {loading ? "logging in" : "Login"}
                </button>
              </div>
            </form>
          </>
        )}
        {showcode && !showSuccess && (
          <>
            <div className="w-full flex flex-col justify-center items-center gap-4">
              <h2 className="flex justify-center items-center font-bold w-full text-[#05132B] text-bold text-[30px] text-center">
                Enter Authentication code
              </h2>
              <h4 className=" text-center flex justify-center items-center font-semibold w-full text-[#878E99] text-bold text-[18px]">
                Authentication code has been sent to admin mail
              </h4>
              <form
                className="w-full flex flex-col justify-center gap-7"
                onSubmit={codeSubmit(CodeValidator)}
              >
                <div className="w-full flex bg-white border-2 border-[#98AAC8] py-3 text-[18px] rounded-md px-4">
                  <input
                    {...codeRgst("code", { required: true })}
                    className="w-full outline-none"
                    placeholder="Enter Code"
                  />
                </div>
                {codeErr.email && (
                  <p className="text-red-500 text-sm -mt-5">code is required</p>
                )}
                <div
                  className={`w-full flex ${code_loading ? "bg-blue-400" : "bg-[#1860D9]"} py-3 text-[18px] rounded-3xl px-4`}
                >
                  <button
                    type="submit"
                    disabled={code_loading}
                    className={`w-full text-white font-bold text-[20px] cursor-pointer`}
                  >
                    Verify Code
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
        {showcode && showSuccess && (
          <>
            <div className="w-full flex flex-col justify-center items-center gap-4">
              <div className="bg-[#1860D9] w-[100px] h-[100px] rounded-full flex items-center justify-center">
                <Check size={60} className="stroke-white stroke-[3]" />
              </div>
              <div className="text-[#05132B] flex flex-col justify-center items-center ">
                <h2 className="text-[35px] font-bold">Verification</h2>
                <h2 className="text-[35px] font-bold">Complete</h2>
              </div>
              <div className="w-auto flex bg-[#1860D9] py-3 text-[18px] rounded-3xl px-8">
                <button
                  onClick={goToAdmin}
                  className="w-full text-[#EDF2FC] font-bold text-[14px] cursor-pointer"
                >
                  Proceed to Admin Dashboard
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
