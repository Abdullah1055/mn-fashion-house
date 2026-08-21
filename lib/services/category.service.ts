import { createClient } from "@/lib/supabase/server";

import type { Category } from "@/types/category";

export type StoreCategory = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
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
   CATEGORY HIERARCHY
========================================================= */

/**
 * Returns only top-level categories.
 *
 * Example:
 * Men
 * Women
 * Kids
 * Others
 */
export async function getParentCategories(): Promise<
  Category[]
> {
  const supabase =
    await createClient();

  const { data, error } =
    await supabase
      .from("categories")
      .select("*")
      .is("parent_id", null)
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

/**
 * Returns child categories of a specific parent.
 *
 * Example:
 * Men
 * ├── Shirts
 * ├── Polo Shirts
 * └── Punjabi
 */
export async function getChildCategories(
  parentId: string
): Promise<Category[]> {
  const supabase =
    await createClient();

  const { data, error } =
    await supabase
      .from("categories")
      .select("*")
      .eq("parent_id", parentId)
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
        "id, name, slug, parent_id"
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