"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { categorySchema } from "@/schemas/category-schema";

export async function createCategory(
  formData: FormData
): Promise<void> {
  const supabase = await createClient();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    is_active: formData.get("is_active") === "on",
  });

  if (!parsed.success) {
    throw new Error("Invalid category data.");
  }

  // Check duplicate name or slug
  const { data: existing, error: checkError } = await supabase
    .from("categories")
    .select("id")
    .or(
      `name.eq.${parsed.data.name},slug.eq.${parsed.data.slug}`
    )
    .maybeSingle();

  if (checkError) {
    throw new Error(checkError.message);
  }

  if (existing) {
    throw new Error(
      "Category name or slug already exists."
    );
  }

  const { error } = await supabase
    .from("categories")
    .insert(parsed.data);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/categories");

  redirect("/admin/categories");
}

export async function updateCategory(
  id: string,
  formData: FormData
): Promise<void> {
  const supabase = await createClient();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    is_active: formData.get("is_active") === "on",
  });

  if (!parsed.success) {
    throw new Error("Invalid category data.");
  }

  // Ignore current category while checking duplicates
  const { data: existing, error: checkError } =
    await supabase
      .from("categories")
      .select("id")
      .neq("id", id)
      .or(
        `name.eq.${parsed.data.name},slug.eq.${parsed.data.slug}`
      )
      .maybeSingle();

  if (checkError) {
    throw new Error(checkError.message);
  }

  if (existing) {
    throw new Error(
      "Category name or slug already exists."
    );
  }

  const { error } = await supabase
    .from("categories")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/categories");

  redirect("/admin/categories");
}