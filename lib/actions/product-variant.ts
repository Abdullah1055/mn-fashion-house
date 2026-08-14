"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

function getVariantFormData(formData: FormData) {
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
      Number(
        formData.get("purchase_cost") || 0
      ),

    regular_price:
      Number(
        formData.get("regular_price") || 0
      ),

    sale_price:
      formData.get("sale_price")
        ? Number(formData.get("sale_price"))
        : null,

    stock_quantity:
      Number(
        formData.get("stock_quantity") || 0
      ),

    low_stock_threshold:
      Number(
        formData.get("low_stock_threshold") || 5
      ),

    is_active:
      formData.get("is_active") === "on",
  };
}

/**
 * Normalize variant values for comparison.
 *
 * Example:
 * " Black " → "black"
 * "BLACK"   → "black"
 * " Black"  → "black"
 */
function normalizeValue(
  value: string | null
) {
  return (value || "")
    .trim()
    .toLowerCase();
}

/**
 * Check whether the same Size + Color
 * already exists for this product.
 *
 * Size and Color are treated as a combination.
 */
async function checkDuplicateVariant(
  productId: string,
  size: string | null,
  color: string | null,
  excludeVariantId?: string
) {
  const supabase = await createClient();

  const normalizedSize =
    normalizeValue(size);

  const normalizedColor =
    normalizeValue(color);

  /*
   * If both size and color are empty,
   * the existing validation will reject it.
   */
  if (
    !normalizedSize &&
    !normalizedColor
  ) {
    return false;
  }

  const { data: existingVariants, error } =
    await supabase
      .from("product_variants")
      .select(
        "id, size, color"
      )
      .eq(
        "product_id",
        productId
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  return (
    existingVariants?.some(
      (existingVariant) => {
        /*
         * Ignore the current variant
         * during update.
         */
        if (
          excludeVariantId &&
          existingVariant.id ===
            excludeVariantId
        ) {
          return false;
        }

        const existingSize =
          normalizeValue(
            existingVariant.size
          );

        const existingColor =
          normalizeValue(
            existingVariant.color
          );

        return (
          existingSize ===
            normalizedSize &&
          existingColor ===
            normalizedColor
        );
      }
    ) ?? false
  );
}

/**
 * Create Product Variant
 */
export async function createProductVariant(
  productId: string,
  formData: FormData
) {
  const supabase = await createClient();

  if (!productId) {
    throw new Error(
      "Product ID is required."
    );
  }

  const variant =
    getVariantFormData(formData);

  /*
   * At least Size or Color is required.
   */
  if (
    !variant.size &&
    !variant.color
  ) {
    throw new Error(
      "Size or color is required."
    );
  }

  /*
   * Prevent duplicate
   * Product + Size + Color
   */
  const duplicate =
    await checkDuplicateVariant(
      productId,
      variant.size,
      variant.color
    );

  if (duplicate) {
    const sizeText =
      variant.size ||
      "No Size";

    const colorText =
      variant.color ||
      "No Color";

    throw new Error(
      `This variant already exists: ${sizeText} / ${colorText}.`
    );
  }

  /*
   * SKU uniqueness check
   */
  if (variant.sku) {
    const {
      data: existingSku,
    } = await supabase
      .from("product_variants")
      .select("id")
      .eq(
        "sku",
        variant.sku
      )
      .maybeSingle();

    if (existingSku) {
      throw new Error(
        "Variant SKU already exists."
      );
    }
  }

  /*
   * Insert variant
   */
  const { error } =
    await supabase
      .from("product_variants")
      .insert({
        product_id:
          productId,
        ...variant,
      });

  if (error) {
    throw new Error(
      error.message
    );
  }

  revalidatePath(
    `/admin/products/${productId}/variants`
  );
}

/**
 * Update Product Variant
 */
export async function updateProductVariant(
  productId: string,
  variantId: string,
  formData: FormData
) {
  const supabase = await createClient();

  if (
    !productId ||
    !variantId
  ) {
    throw new Error(
      "Product and variant are required."
    );
  }

  const variant =
    getVariantFormData(formData);

  /*
   * At least Size or Color is required.
   */
  if (
    !variant.size &&
    !variant.color
  ) {
    throw new Error(
      "Size or color is required."
    );
  }

  /*
   * Prevent duplicate
   * Product + Size + Color.
   *
   * Current variant is excluded
   * from the comparison.
   */
  const duplicate =
    await checkDuplicateVariant(
      productId,
      variant.size,
      variant.color,
      variantId
    );

  if (duplicate) {
    const sizeText =
      variant.size ||
      "No Size";

    const colorText =
      variant.color ||
      "No Color";

    throw new Error(
      `This variant already exists: ${sizeText} / ${colorText}.`
    );
  }

  /*
   * SKU uniqueness check.
   *
   * Current variant is excluded.
   */
  if (variant.sku) {
    const {
      data: existingSku,
    } = await supabase
      .from("product_variants")
      .select("id")
      .eq(
        "sku",
        variant.sku
      )
      .neq(
        "id",
        variantId
      )
      .maybeSingle();

    if (existingSku) {
      throw new Error(
        "Variant SKU already exists."
      );
    }
  }

  /*
   * Update only the requested
   * product variant.
   */
  const { error } =
    await supabase
      .from("product_variants")
      .update(
        variant
      )
      .eq(
        "id",
        variantId
      )
      .eq(
        "product_id",
        productId
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  revalidatePath(
    `/admin/products/${productId}/variants`
  );
}

/**
 * Delete Product Variant
 */
export async function deleteProductVariant(
  productId: string,
  variantId: string
) {
  const supabase = await createClient();

  if (
    !productId ||
    !variantId
  ) {
    throw new Error(
      "Product and variant are required."
    );
  }

  const { error } =
    await supabase
      .from("product_variants")
      .delete()
      .eq(
        "id",
        variantId
      )
      .eq(
        "product_id",
        productId
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  revalidatePath(
    `/admin/products/${productId}/variants`
  );
}