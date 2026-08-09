import { createClient } from "@/lib/supabase/server";

import type { ProductImage } from "@/types/product-image";

export async function getProductImages(
  productId: string
): Promise<ProductImage[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("is_primary", {
      ascending: false,
    })
    .order("sort_order", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data as ProductImage[];
}

export async function getPrimaryProductImage(
  productId: string
): Promise<ProductImage | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .eq("is_primary", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as ProductImage | null;
}