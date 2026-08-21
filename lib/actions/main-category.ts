"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { categorySchema } from "@/schemas/category-schema";

/* =========================================================
   CREATE MAIN CATEGORY
========================================================= */

export async function createMainCategory(
  formData: FormData
): Promise<void> {
  const supabase = await createClient();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    is_active:
      formData.get("is_active") === "on",
    parent_id: null,
  });

  if (!parsed.success) {
    throw new Error(
      "Invalid main category data."
    );
  }

  /* -------------------------------------------------------
     Duplicate name / slug check
  ------------------------------------------------------- */

  const {
    data: existing,
    error: checkError,
  } = await supabase
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

  /* -------------------------------------------------------
     Insert as Top Level Category
  ------------------------------------------------------- */

  const { error } = await supabase
    .from("categories")
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      is_active: parsed.data.is_active,
      parent_id: null,
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/main-categories");
  revalidatePath("/admin/categories");

  redirect("/admin/main-categories");
}

/* =========================================================
   UPDATE MAIN CATEGORY
========================================================= */

export async function updateMainCategory(
  id: string,
  formData: FormData
): Promise<void> {
  const supabase = await createClient();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    is_active:
      formData.get("is_active") === "on",
    parent_id: null,
  });

  if (!parsed.success) {
    throw new Error(
      "Invalid main category data."
    );
  }

  /* -------------------------------------------------------
     Make sure this is actually a Main Category
  ------------------------------------------------------- */

  const {
    data: currentCategory,
    error: currentError,
  } = await supabase
    .from("categories")
    .select("id, parent_id")
    .eq("id", id)
    .maybeSingle();

  if (currentError) {
    throw new Error(currentError.message);
  }

  if (!currentCategory) {
    throw new Error(
      "Main category not found."
    );
  }

  if (currentCategory.parent_id !== null) {
    throw new Error(
      "This category is not a main category."
    );
  }

  /* -------------------------------------------------------
     Duplicate name / slug check
  ------------------------------------------------------- */

  const {
    data: existing,
    error: checkError,
  } = await supabase
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

  /* -------------------------------------------------------
     Update
  ------------------------------------------------------- */

  const { error } = await supabase
    .from("categories")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      is_active: parsed.data.is_active,
      parent_id: null,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/main-categories");
  revalidatePath("/admin/categories");

  redirect("/admin/main-categories");
}

/* =========================================================
   DELETE MAIN CATEGORY
========================================================= */

export async function deleteMainCategory(
  id: string
): Promise<void> {
  const supabase = await createClient();

  /* -------------------------------------------------------
     Make sure category exists and is top-level
  ------------------------------------------------------- */

  const {
    data: category,
    error: categoryError,
  } = await supabase
    .from("categories")
    .select("id, parent_id, name")
    .eq("id", id)
    .maybeSingle();

  if (categoryError) {
    throw new Error(categoryError.message);
  }

  if (!category) {
    throw new Error(
      "Main category not found."
    );
  }

  if (category.parent_id !== null) {
    throw new Error(
      "Only main categories can be deleted here."
    );
  }

  /* -------------------------------------------------------
     Check child categories
  ------------------------------------------------------- */

  const {
    count: childCount,
    error: childError,
  } = await supabase
    .from("categories")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("parent_id", id);

  if (childError) {
    throw new Error(childError.message);
  }

  if ((childCount ?? 0) > 0) {
    throw new Error(
      `"${category.name}" has child categories. Delete or move those categories first.`
    );
  }

  /* -------------------------------------------------------
     Check products
  ------------------------------------------------------- */

  const {
    count: productCount,
    error: productError,
  } = await supabase
    .from("products")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("category_id", id);

  if (productError) {
    throw new Error(productError.message);
  }

  if ((productCount ?? 0) > 0) {
    throw new Error(
      `"${category.name}" is assigned to products. Move those products to another category first.`
    );
  }

  /* -------------------------------------------------------
     Delete
  ------------------------------------------------------- */

  const { error: deleteError } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  /* -------------------------------------------------------
     Revalidate
  ------------------------------------------------------- */

  revalidatePath("/admin/main-categories");
  revalidatePath("/admin/categories");
}