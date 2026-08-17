"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type ProductOfferActionResult = {
  success: boolean;
  error?: string;
};

export async function saveProductOffer(
  productId: string,
  discountPercentage: number
): Promise<ProductOfferActionResult> {
  const supabase =
    await createClient();

  if (!productId) {
    return {
      success: false,
      error: "Product is required.",
    };
  }

  if (
    !Number.isFinite(
      discountPercentage
    ) ||
    discountPercentage <= 0 ||
    discountPercentage >= 100
  ) {
    return {
      success: false,
      error:
        "Discount must be between 1% and 99%.",
    };
  }

  /* -----------------------------------------
     Check product
  ----------------------------------------- */

  const {
    data: product,
    error: productError,
  } =
    await supabase
      .from("products")
      .select(
        "id, sale_price, regular_price"
      )
      .eq(
        "id",
        productId
      )
      .maybeSingle();

  if (productError) {
    return {
      success: false,
      error:
        productError.message,
    };
  }

  if (!product) {
    return {
      success: false,
      error:
        "Product not found.",
    };
  }

  /* -----------------------------------------
     Save / Update Offer

     One product can have only
     one offer.
  ----------------------------------------- */

  const {
    error: upsertError,
  } =
    await supabase
      .from("product_offers")
      .upsert(
        {
          product_id:
            productId,

          discount_percentage:
            discountPercentage,

          is_active: true,

          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "product_id",
        }
      );

  if (upsertError) {
    return {
      success: false,
      error:
        upsertError.message,
    };
  }

  revalidatePath(
    "/admin/offers"
  );

  revalidatePath(
    "/admin/products"
  );

  return {
    success: true,
  };
}


/* =========================================================
   REMOVE / DEACTIVATE OFFER
========================================================= */

export async function removeProductOffer(
  productId: string
): Promise<ProductOfferActionResult> {
  const supabase =
    await createClient();

  if (!productId) {
    return {
      success: false,
      error: "Product is required.",
    };
  }

  const {
    error,
  } = await supabase
    .from("product_offers")
    .update({
      is_active: false,
      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "product_id",
      productId
    );

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath(
    "/admin/offers"
  );

  revalidatePath(
    "/admin/products"
  );

  return {
    success: true,
  };
}