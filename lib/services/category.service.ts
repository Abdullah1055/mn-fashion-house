import { createClient } from "@/lib/supabase/server";

export type StoreCategory = {
  id: string;
  name: string;
  slug: string;
};

/* =========================================================
   GET ALL CATEGORIES
   Used by Admin Categories page
========================================================= */

export async function getCategories(): Promise<
  StoreCategory[]
> {
  const supabase =
    await createClient();

  const { data, error } =
    await supabase
      .from("categories")
      .select(
        "id, name, slug, is_active"
      )
      .order("name", {
        ascending: true,
      });

  if (error) {
    throw error;
  }

  return (data ?? []) as StoreCategory[];
}

/* =========================================================
   GET ACTIVE CATEGORIES
   Used by Product Create/Edit
========================================================= */

export async function getActiveCategories(): Promise<
  StoreCategory[]
> {
  const supabase =
    await createClient();

  const { data, error } =
    await supabase
      .from("categories")
      .select(
        "id, name, slug, is_active"
      )
      .eq("is_active", true)
      .order("name", {
        ascending: true,
      });

  if (error) {
    throw error;
  }

  return (data ?? []) as StoreCategory[];
}

/* =========================================================
   GET CATEGORY BY ID
   Used by Admin Category Edit
========================================================= */

export async function getCategoryById(
  id: string
): Promise<StoreCategory | null> {
  const supabase =
    await createClient();

  const { data, error } =
    await supabase
      .from("categories")
      .select(
        "id, name, slug, is_active"
      )
      .eq("id", id)
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data as StoreCategory | null;
}

/* =========================================================
   GET ACTIVE STORE CATEGORIES
   Used by Customer Homepage
========================================================= */

export async function getStoreCategories(): Promise<
  StoreCategory[]
> {
  return getActiveCategories();
}