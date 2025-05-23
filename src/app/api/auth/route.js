import { createClient } from "@/utils/supabase/client";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req) {
  try {
    

    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: "invalid credential",
        status: 404,
      });
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
        message: "user not found",
        status: 404,
      });
    }
    const resend = new Resend(process.env.RESEND_API);

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const to = user?.email;
    const subject = "verify your Admin login";

    const result = await resend.emails.send({
      from: "admin@admin.nodalcircles.com",
      to: [to],
      subject,
      html: `<h2>Welcome to nodal circle admin</h2>
        <br></br>
        ${code}
      
      `,
    });

    if (result.error) {
      return NextResponse.json({
        success: false,
        status: 500,
        message: result.error.message,
      });
    }

    const { date: uploadDate, error: upload_Error } = await supabase
      .from("code")
      .upsert({
        code,
        id: user.id,
        full_name: user.name,
      });
    if (upload_Error) {
      return NextResponse.json({
        success: false,
        status: 500,
        message: upload_Error.error.message,
      });
    }

    return NextResponse.json({ success: true, message: "code sent" });
  } catch (error) {
    
    return NextResponse.json({ success: false, message: error.message });
  }
}
