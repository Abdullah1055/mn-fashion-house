"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/schemas/product-schema";

export async function createProduct(
  formData: FormData
): Promise<void> {
  const supabase = await createClient();

  const parsed = productSchema.safeParse({
    category_id: formData.get("category_id"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    short_description:
      formData.get("short_description"),
    description: formData.get("description"),
    sku: formData.get("sku"),
    purchase_cost: formData.get("purchase_cost"),
    regular_price: formData.get("regular_price"),
    sale_price:
      formData.get("sale_price") || null,
    stock_quantity:
      formData.get("stock_quantity"),
    low_stock_threshold:
      formData.get("low_stock_threshold"),
    is_featured:
      formData.get("is_featured") === "on",
    is_active:
      formData.get("is_active") === "on",
    seo_title: formData.get("seo_title"),
    seo_description:
      formData.get("seo_description"),
  });

  if (!parsed.success) {
    console.error(parsed.error.flatten());
    throw new Error("Invalid product data.");
  }

  // Duplicate Slug
  const { data: slugExists } = await supabase
    .from("products")
    .select("id")
    .eq("slug", parsed.data.slug)
    .maybeSingle();

  if (slugExists) {
    throw new Error("Slug already exists.");
  }

  // Duplicate SKU
  if (parsed.data.sku) {
    const { data: skuExists } = await supabase
      .from("products")
      .select("id")
      .eq("sku", parsed.data.sku)
      .maybeSingle();

    if (skuExists) {
      throw new Error("SKU already exists.");
    }
  }

  const { error } = await supabase
    .from("products")
    .insert(parsed.data);

  if (error) {
    throw error;
  }

  revalidatePath("/admin/products");

  redirect("/admin/products");
}