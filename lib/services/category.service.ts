import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types/category";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return data as Category[];
}

export async function getCategoryById(
  id: string
): Promise<Category | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return data as Category;
}

export async function getActiveCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data;
}