import { createClient } from "@/lib/supabase/server";

import type { ProductVariant } from "@/types/product-variant";

export async function getProductVariants(
  productId: string
): Promise<ProductVariant[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data as ProductVariant[];
}

export async function getProductVariantById(
  id: string
): Promise<ProductVariant | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as ProductVariant | null;
}