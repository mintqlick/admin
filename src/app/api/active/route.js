// app/api/admin-users/route.ts
import supabase from "@/utils/supabase/admin";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // safe on the server
);

export async function GET() {
  const { data, error } = await supabaseAdmin.rpc("weekly_active_users");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}
