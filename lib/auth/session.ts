import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const getSession = cache(async () => {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
});

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}