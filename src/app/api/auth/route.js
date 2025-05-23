import { createClient } from "@/utils/supabase/client";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json("invalid credentials");
    }
    const supabase = createClient();
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return NextResponse.json({ message: "invalid credential", status: 404 });
    }
    const resend = new Resend(process.env.RESEND_API);

    const to = "ademolapamilerin51@gmail.com";
    const subject = "verify your login";
    const text = "my name is Ademol";

   const result = await resend.emails.send({
      from: "adeakanfea@gmail.com",
      to: [to],
      subject,
      html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
    });

    console.log(result)

    return NextResponse.json({ success: true, message: "" });
  } catch (error) {
    console.log(error.message);
    return NextResponse.json({ success: false, message: error.message });
  }
}
