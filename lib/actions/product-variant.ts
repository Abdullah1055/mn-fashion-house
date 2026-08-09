"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

function getVariantFormData(
  formData: FormData
) {
  return {
    sku:
      String(formData.get("sku") || "").trim() ||
      null,

    size:
      String(formData.get("size") || "").trim() ||
      null,

    color:
      String(formData.get("color") || "").trim() ||
      null,

    purchase_cost:
      Number(formData.get("purchase_cost") || 0),

    regular_price:
      Number(formData.get("regular_price") || 0),

    sale_price:
      formData.get("sale_price")
        ? Number(formData.get("sale_price"))
        : null,

    stock_quantity:
      Number(formData.get("stock_quantity") || 0),

    low_stock_threshold:
      Number(
        formData.get(
          "low_stock_threshold"
        ) || 5
      ),

    is_active:
      formData.get("is_active") === "on",
  };
}

export async function createProductVariant(
  productId: string,
  formData: FormData
) {
  const supabase = await createClient();

  const variant =
    getVariantFormData(formData);

  if (!variant.size && !variant.color) {
    throw new Error(
      "Size or color is required."
    );
  }

  if (variant.sku) {
    const { data: existingSku } =
      await supabase
        .from("product_variants")
        .select("id")
        .eq("sku", variant.sku)
        .maybeSingle();

    if (existingSku) {
      throw new Error(
        "Variant SKU already exists."
      );
    }
  }

  const { error } = await supabase
    .from("product_variants")
    .insert({
      product_id: productId,
      ...variant,
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(
    `/admin/products/${productId}/variants`
  );
}

export async function updateProductVariant(
  productId: string,
  variantId: string,
  formData: FormData
) {
  const supabase = await createClient();

  const variant =
    getVariantFormData(formData);

  if (!variant.size && !variant.color) {
    throw new Error(
      "Size or color is required."
    );
  }

  if (variant.sku) {
    const { data: existingSku } =
      await supabase
        .from("product_variants")
        .select("id")
        .eq("sku", variant.sku)
        .neq("id", variantId)
        .maybeSingle();

    if (existingSku) {
      throw new Error(
        "Variant SKU already exists."
      );
    }
  }

  const { error } = await supabase
    .from("product_variants")
    .update(variant)
    .eq("id", variantId)
    .eq("product_id", productId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(
    `/admin/products/${productId}/variants`
  );
}

export async function deleteProductVariant(
  productId: string,
  variantId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("product_variants")
    .delete()
    .eq("id", variantId)
    .eq("product_id", productId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(
    `/admin/products/${productId}/variants`
  );
}