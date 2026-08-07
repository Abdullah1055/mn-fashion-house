"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { categorySchema } from "@/schemas/category-schema";

export async function createCategory(formData: FormData) {
  const supabase = await createClient();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    is_active: formData.get("is_active") === "on",
  });

  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors,
    };
  }

  // Check duplicate name or slug
  const { data: existing, error: checkError } = await supabase
    .from("categories")
    .select("id")
    .or(`name.eq.${parsed.data.name},slug.eq.${parsed.data.slug}`)
    .maybeSingle();

  if (checkError) {
    return {
      error: {
        database: checkError.message,
      },
    };
  }

  if (existing) {
    return {
      error: {
        database: "Category name or slug already exists.",
      },
    };
  }

  // Insert category
  const { error } = await supabase
    .from("categories")
    .insert(parsed.data);

  if (error) {
    return {
      error: {
        database: error.message,
      },
    };
  }

  revalidatePath("/admin/categories");

  redirect("/admin/categories");
}

export async function updateCategory(
  id: string,
  formData: FormData
) {
  const supabase = await createClient();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    is_active: formData.get("is_active") === "on",
  });

  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors,
    };
  }

  // Ignore current category while checking duplicates
  const { data: existing, error: checkError } = await supabase
    .from("categories")
    .select("id")
    .neq("id", id)
    .or(`name.eq.${parsed.data.name},slug.eq.${parsed.data.slug}`)
    .maybeSingle();

  if (checkError) {
    return {
      error: {
        database: checkError.message,
      },
    };
  }

  if (existing) {
    return {
      error: {
        database: "Category name or slug already exists.",
      },
    };
  }

  // Update category
  const { error } = await supabase
    .from("categories")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    return {
      error: {
        database: error.message,
      },
    };
  }

  revalidatePath("/admin/categories");

  redirect("/admin/categories");
}