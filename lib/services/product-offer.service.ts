import { createClient } from "@/lib/supabase/server";

import type { ProductOffer } from "@/types/product-offer";

export async function getProductOffers(): Promise<
  ProductOffer[]
> {
  const supabase =
    await createClient();

  const { data, error } =
    await supabase
      .from("product_offers")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    throw error;
  }

  return (data ?? []) as ProductOffer[];
}

export async function getProductOfferByProductId(
  productId: string
): Promise<ProductOffer | null> {
  const supabase =
    await createClient();

  const { data, error } =
    await supabase
      .from("product_offers")
      .select("*")
      .eq(
        "product_id",
        productId
      )
      .eq(
        "is_active",
        true
      )
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data as ProductOffer | null;
}