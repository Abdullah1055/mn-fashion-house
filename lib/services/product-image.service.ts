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
    .order("sort_order");

  if (error) {
    throw error;
  }

  return data as ProductImage[];
}