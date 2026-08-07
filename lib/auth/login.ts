import { createClient } from "@/lib/supabase/client";

export async function signIn(
  email: string,
  password: string
) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    data,
    error,
  };
}

export async function signOut() {
  const supabase = createClient();

  await supabase.auth.signOut();
}