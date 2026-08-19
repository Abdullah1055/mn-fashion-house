"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/schemas/product-schema";

type SizeVariant = {
  size: string;
  quantity: number;
};

export type ProductVariantForForm = {
  id: string;
  product_id: string;
  color: string | null;
  size: string | null;
  stock_quantity: number;
};

/* =========================================================
   HELPERS
========================================================= */

function getString(
  formData: FormData,
  key: string
): string {
  return String(
    formData.get(key) || ""
  ).trim();
}

function getNumber(
  formData: FormData,
  key: string,
  fallback = 0
): number {
  const value = Number(
    formData.get(key)
  );

  return Number.isFinite(value)
    ? value
    : fallback;
}

/* =========================================================
   GET SIZE + QUANTITY
========================================================= */

function getSizeVariants(
  formData: FormData
): SizeVariant[] {
  const variants: SizeVariant[] = [];

  let index = 0;

  while (true) {
    const sizeKey =
      `size_${index}`;

    const quantityKey =
      `quantity_${index}`;

    const hasSize =
      formData.has(sizeKey);

    const hasQuantity =
      formData.has(
        quantityKey
      );

    if (
      !hasSize &&
      !hasQuantity
    ) {
      break;
    }

    const size =
      getString(
        formData,
        sizeKey
      );

    const quantity =
      getNumber(
        formData,
        quantityKey,
        0
      );

    if (size) {
      variants.push({
        size,
        quantity:
          Math.max(
            0,
            Math.floor(quantity)
          ),
      });
    }

    index++;
  }

  return variants;
}

/* =========================================================
   PRODUCT FORM DATA
========================================================= */

function getProductFormData(
  formData: FormData
) {
  const brandId =
    getString(
      formData,
      "brand_id"
    );

  const variants =
    getSizeVariants(
      formData
    );

  const totalStock =
    variants.reduce(
      (
        total,
        variant
      ) =>
        total +
        variant.quantity,
      0
    );

  const salePriceValue =
    getString(
      formData,
      "sale_price"
    );

  return {
    category_id:
      getString(
        formData,
        "category_id"
      ),

    brand_id:
      brandId || null,

    name:
      getString(
        formData,
        "name"
      ),

    slug:
      getString(
        formData,
        "slug"
      ),

    short_description:
      getString(
        formData,
        "short_description"
      ) || null,

    description:
      getString(
        formData,
        "description"
      ) || null,

    sku:
      getString(
        formData,
        "sku"
      ) || null,

    color:
      getString(
        formData,
        "color"
      ) || null,

    /*
     * Size is stored in
     * product_variants.
     */
    size: null,

    purchase_cost:
      getNumber(
        formData,
        "purchase_cost"
      ),

    regular_price:
      getNumber(
        formData,
        "regular_price"
      ),

    sale_price:
      salePriceValue
        ? getNumber(
            formData,
            "sale_price"
          )
        : null,

    /*
     * Total product stock.
     */
    stock_quantity:
      totalStock,

    low_stock_threshold:
      getNumber(
        formData,
        "low_stock_threshold",
        3
      ),

    is_featured:
      formData.get(
        "is_featured"
      ) === "on",

    is_active:
      formData.get(
        "is_active"
      ) === "on",

    seo_title:
      getString(
        formData,
        "seo_title"
      ) || null,

    seo_description:
      getString(
        formData,
        "seo_description"
      ) || null,
  };
}

/* =========================================================
   GET VARIANTS FOR EDIT FORM
========================================================= */

export async function getProductVariantsForForm(
  productId: string
): Promise<
  ProductVariantForForm[]
> {
  const supabase =
    await createClient();

  if (!productId) {
    return [];
  }

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "product_variants"
      )
      .select(
        `
          id,
          product_id,
          color,
          size,
          stock_quantity
        `
      )
      .eq(
        "product_id",
        productId
      )
      .order(
        "created_at",
        {
          ascending: true,
        }
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  return (
    data ?? []
  ) as ProductVariantForForm[];
}

/* =========================================================
   CREATE PRODUCT
========================================================= */

export async function createProduct(
  formData: FormData
) {
  const supabase =
    await createClient();

  const variants =
    getSizeVariants(
      formData
    );

  if (
    variants.length === 0
  ) {
    throw new Error(
      "At least one size is required."
    );
  }

  const productData =
    getProductFormData(
      formData
    );

  const parsed =
    productSchema.safeParse(
      productData
    );

  if (!parsed.success) {
    console.error(
      "Product validation error:",
      parsed.error.flatten()
    );

    throw new Error(
      "Invalid product data."
    );
  }

  /* -------------------------------------------------------
     DUPLICATE SLUG
  ------------------------------------------------------- */

  const {
    data: slugExists,
    error: slugCheckError,
  } =
    await supabase
      .from("products")
      .select("id")
      .eq(
        "slug",
        parsed.data.slug
      )
      .maybeSingle();

  if (slugCheckError) {
    throw new Error(
      slugCheckError.message
    );
  }

  if (slugExists) {
    throw new Error(
      "Product slug already exists."
    );
  }

  /* -------------------------------------------------------
     DUPLICATE SKU
  ------------------------------------------------------- */

  if (parsed.data.sku) {
    const {
      data: skuExists,
      error: skuCheckError,
    } =
      await supabase
        .from("products")
        .select("id")
        .eq(
          "sku",
          parsed.data.sku
        )
        .maybeSingle();

    if (skuCheckError) {
      throw new Error(
        skuCheckError.message
      );
    }

    if (skuExists) {
      throw new Error(
        "Product SKU already exists."
      );
    }
  }

  /* -------------------------------------------------------
     CREATE PRODUCT
  ------------------------------------------------------- */

  const {
    data: createdProduct,
    error: productError,
  } =
    await supabase
      .from("products")
      .insert(
        parsed.data
      )
      .select("id")
      .single();

  if (productError) {
    throw new Error(
      productError.message
    );
  }

  if (!createdProduct) {
    throw new Error(
      "Product could not be created."
    );
  }

  /* -------------------------------------------------------
     CREATE VARIANTS
  ------------------------------------------------------- */

  const variantRows =
    variants.map(
      (variant) => ({
        product_id:
          createdProduct.id,

        sku: null,

        color:
          parsed.data.color,

        size:
          variant.size,

        price:
          parsed.data
            .regular_price,

        discount_price:
          parsed.data
            .sale_price,

        stock_quantity:
          variant.quantity,

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
    await supabase
      .from("products")
      .delete()
      .eq(
        "id",
        createdProduct.id
      );

    throw new Error(
      variantError.message
    );
  }

  /* -------------------------------------------------------
     REVALIDATE
  ------------------------------------------------------- */

  revalidatePath(
    "/admin/products"
  );

  revalidatePath(
    "/admin/dashboard"
  );

  revalidatePath(
    "/admin/store-selling"
  );

  revalidatePath(
    "/admin/orders"
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

  const variants =
    getSizeVariants(
      formData
    );

  if (
    variants.length === 0
  ) {
    throw new Error(
      "At least one size is required."
    );
  }

  const productData =
    getProductFormData(
      formData
    );

  const parsed =
    productSchema.safeParse(
      productData
    );

  if (!parsed.success) {
    console.error(
      "Product validation error:",
      parsed.error.flatten()
    );

    throw new Error(
      "Invalid product data."
    );
  }

  /* -------------------------------------------------------
     DUPLICATE SLUG
  ------------------------------------------------------- */

  const {
    data: slugExists,
    error: slugCheckError,
  } =
    await supabase
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

  if (slugCheckError) {
    throw new Error(
      slugCheckError.message
    );
  }

  if (slugExists) {
    throw new Error(
      "Product slug already exists."
    );
  }

  /* -------------------------------------------------------
     DUPLICATE SKU
  ------------------------------------------------------- */

  if (parsed.data.sku) {
    const {
      data: skuExists,
      error: skuCheckError,
    } =
      await supabase
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

    if (skuCheckError) {
      throw new Error(
        skuCheckError.message
      );
    }

    if (skuExists) {
      throw new Error(
        "Product SKU already exists."
      );
    }
  }

  /* -------------------------------------------------------
     UPDATE PRODUCT
  ------------------------------------------------------- */

  const {
    error: productError,
  } =
    await supabase
      .from("products")
      .update(
        parsed.data
      )
      .eq(
        "id",
        id
      );

  if (productError) {
    throw new Error(
      productError.message
    );
  }

  /* -------------------------------------------------------
     DELETE OLD VARIANTS
  ------------------------------------------------------- */

  const {
    error: deleteVariantError,
  } =
    await supabase
      .from(
        "product_variants"
      )
      .delete()
      .eq(
        "product_id",
        id
      );

  if (deleteVariantError) {
    throw new Error(
      deleteVariantError.message
    );
  }

  /* -------------------------------------------------------
     INSERT UPDATED VARIANTS
  ------------------------------------------------------- */

  const variantRows =
    variants.map(
      (variant) => ({
        product_id:
          id,

        sku: null,

        color:
          parsed.data.color,

        size:
          variant.size,

        price:
          parsed.data
            .regular_price,

        discount_price:
          parsed.data
            .sale_price,

        stock_quantity:
          variant.quantity,

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
    throw new Error(
      variantError.message
    );
  }

  /* -------------------------------------------------------
     REVALIDATE
  ------------------------------------------------------- */

  revalidatePath(
    "/admin/products"
  );

  revalidatePath(
    `/admin/products/${id}`
  );

  revalidatePath(
    `/admin/products/${id}/variants`
  );

  revalidatePath(
    "/admin/dashboard"
  );

  revalidatePath(
    "/admin/store-selling"
  );

  revalidatePath(
    "/admin/orders"
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

  /* -------------------------------------------------------
     CHECK PRODUCT
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     DELETE PRODUCT IMAGES
  ------------------------------------------------------- */

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
            Boolean(file.name)
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

  /* -------------------------------------------------------
     DELETE PRODUCT
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     REVALIDATE
  ------------------------------------------------------- */

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