import { createClient } from "@/lib/supabase/server";

import type { Category } from "@/types/category";

export type StoreCategory = {
  id: string;
  name: string;
  slug: string;
};

/* =========================================================
   ADMIN
========================================================= */

export async function getCategories(): Promise<
  Category[]
> {
  const supabase =
    await createClient();

  const { data, error } =
    await supabase
      .from("categories")
      .select("*")
      .order("sort_order", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      });

  if (error) {
    throw error;
  }

  return (data ?? []) as Category[];
}

export async function getActiveCategories(): Promise<
  Category[]
> {
  const supabase =
    await createClient();

  const { data, error } =
    await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      });

  if (error) {
    throw error;
  }

  return (data ?? []) as Category[];
}

export async function getCategoryById(
  id: string
): Promise<Category | null> {
  const supabase =
    await createClient();

  const { data, error } =
    await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Category | null;
}

/* =========================================================
   STOREFRONT
========================================================= */

export async function getStoreCategories(): Promise<
  StoreCategory[]
> {
  const supabase =
    await createClient();

  const { data, error } =
    await supabase
      .from("categories")
      .select(
        "id, name, slug"
      )
      .eq("is_active", true)
      .order("sort_order", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      });

  if (error) {
    throw error;
  }

  return (data ?? []) as StoreCategory[];
}