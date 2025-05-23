import { createClient } from "@/utils/supabase/client";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password, code } = await req.json();

    if (!email || !password) {
      return NextResponse.json("invalid credentials");
    }
    const supabase = createClient();
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("admin", true)
      .single();

    if (error || !user) {
      return NextResponse.json({
        success: false,
        message: "invalid credential",
        status: 404,
      });
    }
    const { data: resData, error: upload_Error } = await supabase
      .from("code")
      .select("*")
      .eq("id", user.id)
      .single();

    if (upload_Error) {
      return NextResponse.json({
        success: false,
        status: 500,
        message: upload_Error.error.message,
      });
    }

    const { code: dbCode } = resData;

    if (code !== dbCode) {
      return NextResponse.json({ message: "invalid code", status: 404 });
    }

    return NextResponse.json({ success: true, message: "success" });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
