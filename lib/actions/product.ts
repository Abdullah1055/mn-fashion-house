"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/schemas/product-schema";

type VariantFormItem = {
  id?: string;
  color: string;
  size: string;
  stock_quantity: number;
  sku: string;
};

function getProductFormData(
  formData: FormData
) {
  const brandId =
    String(
      formData.get("brand_id") || ""
    ).trim();

  return {
    category_id:
      formData.get("category_id"),

    brand_id:
      brandId || null,

    name:
      formData.get("name"),

    slug:
      formData.get("slug"),

    short_description:
      formData.get(
        "short_description"
      ),

    description:
      formData.get("description"),

    sku:
      formData.get("sku"),

    /*
     * Legacy fields are intentionally
     * kept only because the existing
     * product schema/database still
     * contains them.
     *
     * New inventory logic does NOT
     * use these values.
     */
    color:
      "",

    size:
      "",

    purchase_cost:
      formData.get("purchase_cost"),

    regular_price:
      formData.get("regular_price"),

    sale_price:
      formData.get("sale_price") ||
      null,

    stock_quantity:
      formData.get("stock_quantity") ||
      0,

    low_stock_threshold:
      formData.get(
        "low_stock_threshold"
      ),

    is_featured:
      formData.get("is_featured") ===
      "on",

    is_active:
      formData.get("is_active") ===
      "on",

    seo_title:
      formData.get("seo_title"),

    seo_description:
      formData.get(
        "seo_description"
      ),
  };
}

function getVariantsFromFormData(
  formData: FormData
): VariantFormItem[] {
  const raw =
    String(
      formData.get(
        "variant_data"
      ) || "[]"
    );

  try {
    const parsed =
      JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => ({
        id:
          typeof item?.id ===
          "string"
            ? item.id
            : undefined,

        color:
          String(
            item?.color || ""
          ).trim(),

        size:
          String(
            item?.size || ""
          ).trim(),

        stock_quantity:
          Number(
            item?.stock_quantity ||
              0
          ),

        sku:
          String(
            item?.sku || ""
          ).trim(),
      }))
      .filter(
        (variant) =>
          variant.color &&
          variant.size &&
          Number.isInteger(
            variant.stock_quantity
          ) &&
          variant.stock_quantity >=
            0
      );
  } catch {
    throw new Error(
      "Invalid product variant data."
    );
  }
}

function validateVariants(
  variants: VariantFormItem[]
) {
  const combinations =
    new Set<string>();

  const skus =
    new Set<string>();

  for (const variant of variants) {
    const color =
      variant.color
        .trim()
        .toLowerCase();

    const size =
      variant.size
        .trim()
        .toLowerCase();

    const combination =
      `${color}::${size}`;

    if (
      combinations.has(
        combination
      )
    ) {
      throw new Error(
        `Duplicate variant: ${variant.color} / ${variant.size}.`
      );
    }

    combinations.add(
      combination
    );

    if (variant.sku) {
      const sku =
        variant.sku
          .trim()
          .toLowerCase();

      if (skus.has(sku)) {
        throw new Error(
          `Duplicate variant SKU: ${variant.sku}.`
        );
      }

      skus.add(sku);
    }
  }
}

function calculateTotalStock(
  variants: VariantFormItem[]
) {
  return variants.reduce(
    (total, variant) =>
      total +
      Number(
        variant.stock_quantity
      ),
    0
  );
}

async function checkVariantSkus(
  supabase: Awaited<
    ReturnType<typeof createClient>
  >,
  variants: VariantFormItem[],
  productId?: string
) {
  const skuValues =
    variants
      .map((variant) =>
        variant.sku.trim()
      )
      .filter(Boolean);

  if (
    skuValues.length === 0
  ) {
    return;
  }

  const { data, error } =
    await supabase
      .from("product_variants")
      .select("id, sku")
      .in(
        "sku",
        skuValues
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  const currentIds =
    new Set(
      variants
        .map(
          (variant) =>
            variant.id
        )
        .filter(Boolean)
    );

  const conflicting =
    (data ?? []).find(
      (item) =>
        !currentIds.has(
          item.id
        )
    );

  if (conflicting) {
    throw new Error(
      `Variant SKU already exists: ${conflicting.sku}.`
    );
  }
}

/* =========================================================
   CREATE PRODUCT
========================================================= */

export async function createProduct(
  formData: FormData
) {
  const supabase =
    await createClient();

  const parsed =
    productSchema.safeParse(
      getProductFormData(
        formData
      )
    );

  if (!parsed.success) {
    throw new Error(
      "Invalid product data."
    );
  }

  const variants =
    getVariantsFromFormData(
      formData
    );

  validateVariants(
    variants
  );

  if (
    variants.length === 0
  ) {
    throw new Error(
      "Please add at least one product variant."
    );
  }

  const totalStock =
    calculateTotalStock(
      variants
    );

  const {
    data: slugExists,
  } = await supabase
    .from("products")
    .select("id")
    .eq(
      "slug",
      parsed.data.slug
    )
    .maybeSingle();

  if (slugExists) {
    throw new Error(
      "Product slug already exists."
    );
  }

  if (parsed.data.sku) {
    const {
      data: skuExists,
    } = await supabase
      .from("products")
      .select("id")
      .eq(
        "sku",
        parsed.data.sku
      )
      .maybeSingle();

    if (skuExists) {
      throw new Error(
        "Product SKU already exists."
      );
    }
  }

  await checkVariantSkus(
    supabase,
    variants
  );

  /*
   * Product-level stock is now
   * calculated from variants.
   */
  const productData = {
    ...parsed.data,
    stock_quantity:
      totalStock,
    color: null,
    size: null,
  };

  const {
    data: product,
    error: productError,
  } =
    await supabase
      .from("products")
      .insert(
        productData
      )
      .select("id")
      .single();

  if (productError) {
    throw new Error(
      productError.message
    );
  }

  /*
   * Existing product_variants table
   * only uses:
   *
   * product_id
   * sku
   * color
   * size
   * price
   * discount_price
   * stock_quantity
   * barcode
   *
   * Price comes from the product.
   */
  const variantRows =
    variants.map(
      (variant) => ({
        product_id:
          product.id,

        sku:
          variant.sku ||
          null,

        color:
          variant.color,

        size:
          variant.size,

        price:
          Number(
            parsed.data
              .regular_price
          ),

        discount_price:
          parsed.data
            .sale_price !==
          null
            ? Number(
                parsed.data
                  .sale_price
              )
            : null,

        stock_quantity:
          variant.stock_quantity,

        barcode: null,
      })
    );

  const {
    error: variantError,
  } =
    await supabase
      .from(
        "product_variants"
      )
      .insert(
        variantRows
      );

  if (variantError) {
    /*
     * Roll back the product if
     * variant insertion fails.
     */
    await supabase
      .from("products")
      .delete()
      .eq(
        "id",
        product.id
      );

    throw new Error(
      variantError.message
    );
  }

  revalidatePath(
    "/admin/products"
  );

  revalidatePath(
    "/"
  );

  redirect(
    "/admin/products"
  );
}

/* =========================================================
   UPDATE PRODUCT
========================================================= */

export async function updateProduct(
  id: string,
  formData: FormData
) {
  const supabase =
    await createClient();

  if (!id) {
    throw new Error(
      "Product ID is required."
    );
  }

  const parsed =
    productSchema.safeParse(
      getProductFormData(
        formData
      )
    );

  if (!parsed.success) {
    throw new Error(
      "Invalid product data."
    );
  }

  const variants =
    getVariantsFromFormData(
      formData
    );

  validateVariants(
    variants
  );

  if (
    variants.length === 0
  ) {
    throw new Error(
      "Please add at least one product variant."
    );
  }

  const totalStock =
    calculateTotalStock(
      variants
    );

  const {
    data: slugExists,
  } = await supabase
    .from("products")
    .select("id")
    .eq(
      "slug",
      parsed.data.slug
    )
    .neq(
      "id",
      id
    )
    .maybeSingle();

  if (slugExists) {
    throw new Error(
      "Product slug already exists."
    );
  }

  if (parsed.data.sku) {
    const {
      data: skuExists,
    } = await supabase
      .from("products")
      .select("id")
      .eq(
        "sku",
        parsed.data.sku
      )
      .neq(
        "id",
        id
      )
      .maybeSingle();

    if (skuExists) {
      throw new Error(
        "Product SKU already exists."
      );
    }
  }

  await checkVariantSkus(
    supabase,
    variants,
    id
  );

  /*
   * Update product.
   */
  const { error } =
    await supabase
      .from("products")
      .update({
        ...parsed.data,
        stock_quantity:
          totalStock,
        color: null,
        size: null,
      })
      .eq(
        "id",
        id
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  /*
   * Existing variants are synchronized
   * without touching product data.
   *
   * Existing variant IDs are updated.
   * New variants are inserted.
   */
  const existingIds =
    variants
      .map(
        (variant) =>
          variant.id
      )
      .filter(
        (
          value
        ): value is string =>
          Boolean(value)
      );

  const {
    data: currentVariants,
    error:
      currentVariantsError,
  } =
    await supabase
      .from(
        "product_variants"
      )
      .select(
        "id"
      )
      .eq(
        "product_id",
        id
      );

  if (
    currentVariantsError
  ) {
    throw new Error(
      currentVariantsError.message
    );
  }

  const submittedIdSet =
    new Set(
      existingIds
    );

  /*
   * Remove variants that were
   * deleted from the form.
   */
  const variantsToDelete =
    (currentVariants ?? [])
      .map(
        (variant) =>
          variant.id
      )
      .filter(
        (variantId) =>
          !submittedIdSet.has(
            variantId
          )
      );

  if (
    variantsToDelete.length >
    0
  ) {
    const {
      error:
        deleteVariantsError,
    } =
      await supabase
        .from(
          "product_variants"
        )
        .delete()
        .in(
          "id",
          variantsToDelete
        )
        .eq(
          "product_id",
          id
        );

    if (
      deleteVariantsError
    ) {
      throw new Error(
        deleteVariantsError.message
      );
    }
  }

  /*
   * Update / insert variants.
   */
  for (
    const variant of variants
  ) {
    const variantData = {
      sku:
        variant.sku ||
        null,

      color:
        variant.color,

      size:
        variant.size,

      price:
        Number(
          parsed.data
            .regular_price
        ),

      discount_price:
        parsed.data
          .sale_price !==
        null
          ? Number(
              parsed.data
                .sale_price
            )
          : null,

      stock_quantity:
        variant.stock_quantity,

      barcode: null,
    };

    if (variant.id) {
      const {
        error:
          updateVariantError,
      } =
        await supabase
          .from(
            "product_variants"
          )
          .update(
            variantData
          )
          .eq(
            "id",
            variant.id
          )
          .eq(
            "product_id",
            id
          );

      if (
        updateVariantError
      ) {
        throw new Error(
          updateVariantError.message
        );
      }
    } else {
      const {
        error:
          insertVariantError,
      } =
        await supabase
          .from(
            "product_variants"
          )
          .insert({
            product_id:
              id,
            ...variantData,
          });

      if (
        insertVariantError
      ) {
        throw new Error(
          insertVariantError.message
        );
      }
    }
  }

  revalidatePath(
    "/admin/products"
  );

  revalidatePath(
    `/admin/products/${id}`
  );

  revalidatePath(
    "/"
  );

  redirect(
    "/admin/products"
  );
}

/* =========================================================
   DELETE PRODUCT
========================================================= */

export async function deleteProduct(
  productId: string
) {
  const supabase =
    await createClient();

  if (!productId) {
    return {
      success: false,
      error:
        "Product ID is required.",
    };
  }

  const {
    data: product,
    error: productError,
  } =
    await supabase
      .from("products")
      .select(
        "id, name"
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

  const {
    data: storageFiles,
    error: listError,
  } =
    await supabase.storage
      .from(
        "product-images"
      )
      .list(
        productId
      );

  if (listError) {
    return {
      success: false,
      error:
        `Unable to access product images: ${listError.message}`,
    };
  }

  if (
    storageFiles &&
    storageFiles.length > 0
  ) {
    const storagePaths =
      storageFiles
        .filter(
          (file) =>
            file.name
        )
        .map(
          (file) =>
            `${productId}/${file.name}`
        );

    if (
      storagePaths.length > 0
    ) {
      const {
        error:
          storageDeleteError,
      } =
        await supabase.storage
          .from(
            "product-images"
          )
          .remove(
            storagePaths
          );

      if (
        storageDeleteError
      ) {
        return {
          success: false,
          error:
            `Unable to delete product images: ${storageDeleteError.message}`,
        };
      }
    }
  }

  const {
    error: deleteError,
  } =
    await supabase
      .from("products")
      .delete()
      .eq(
        "id",
        productId
      );

  if (deleteError) {
    return {
      success: false,
      error:
        deleteError.message,
    };
  }

  revalidatePath(
    "/admin/products"
  );

  revalidatePath(
    "/admin/dashboard"
  );

  revalidatePath(
    "/admin/orders"
  );

  revalidatePath(
    "/admin/store-selling"
  );

  revalidatePath(
    "/"
  );

  return {
    success: true,
  };
}