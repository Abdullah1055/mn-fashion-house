"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/schemas/product-schema";

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

    color:
      formData.get("color"),
      
    size:
      formData.get("size"),

    purchase_cost:
      formData.get("purchase_cost"),

    regular_price:
      formData.get("regular_price"),

    sale_price:
      formData.get("sale_price") || null,

    stock_quantity:
      formData.get("stock_quantity"),

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

export async function createProduct(
  formData: FormData
) {
  const supabase =
    await createClient();

  const parsed =
    productSchema.safeParse(
      getProductFormData(formData)
    );

  if (!parsed.success) {
    throw new Error(
      "Invalid product data."
    );
  }

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

  const { error } =
    await supabase
      .from("products")
      .insert(
        parsed.data
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  revalidatePath(
    "/admin/products"
  );

  redirect(
    "/admin/products"
  );
}

export async function updateProduct(
  id: string,
  formData: FormData
) {
  const supabase =
    await createClient();

  const parsed =
    productSchema.safeParse(
      getProductFormData(formData)
    );

  if (!parsed.success) {
    throw new Error(
      "Invalid product data."
    );
  }

  const {
    data: slugExists,
  } = await supabase
    .from("products")
    .select("id")
    .eq(
      "slug",
      parsed.data.slug
    )
    .neq("id", id)
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
      .neq("id", id)
      .maybeSingle();

    if (skuExists) {
      throw new Error(
        "Product SKU already exists."
      );
    }
  }

  const { error } =
    await supabase
      .from("products")
      .update(
        parsed.data
      )
      .eq(
        "id",
        id
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  revalidatePath(
    "/admin/products"
  );

  revalidatePath(
    `/admin/products/${id}`
  );

  redirect(
    "/admin/products"
  );
}