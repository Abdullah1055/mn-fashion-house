import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/product";

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(
        id,
        name
      ),
      brand:brands(
        id,
        name
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data as Product[];
}

export async function getProductById(
  id: string
): Promise<Product | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(
        id,
        name
      ),
      brand:brands(
        id,
        name
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return data as Product;
}