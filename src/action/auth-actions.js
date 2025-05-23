"use server";

import { createClient as serverCreateClient } from "@/utils/supabase/server";

export const signInAction = async (data) => {
  const supabase = await serverCreateClient(); // Pass `req` for server-side
  const { data: lgData, error } = await supabase.auth.signInWithPassword(data);
  if (error) {
    
    return { message: error.message, error: true };
  }
};
