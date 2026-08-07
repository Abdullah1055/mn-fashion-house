"use server";

import { createClient } from "@/lib/supabase/server";

export async function deleteProductImage(
  id: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}