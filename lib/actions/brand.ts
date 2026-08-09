"use server";

import { createClient } from "@/lib/supabase/server";

type BrandActionResult = {
  success: boolean;
  error?: string;
};

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createBrand(
  formData: FormData
): Promise<BrandActionResult> {
  const supabase = await createClient();

  const name =
    String(formData.get("name") || "").trim();

  const description =
    String(
      formData.get("description") || ""
    ).trim();

  const logoUrl =
    String(
      formData.get("logo_url") || ""
    ).trim();

  if (!name) {
    return {
      success: false,
      error: "Brand name is required.",
    };
  }

  const slug = createSlug(name);

  if (!slug) {
    return {
      success: false,
      error: "Unable to generate brand slug.",
    };
  }

  const { error } = await supabase
    .from("brands")
    .insert({
      name,
      slug,
      description: description || null,
      logo_url: logoUrl || null,
      is_active: true,
    });

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error:
          "A brand with this name already exists.",
      };
    }

    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
}

export async function updateBrand(
  id: string,
  formData: FormData
): Promise<BrandActionResult> {
  const supabase = await createClient();

  const name =
    String(formData.get("name") || "").trim();

  const description =
    String(
      formData.get("description") || ""
    ).trim();

  const logoUrl =
    String(
      formData.get("logo_url") || ""
    ).trim();

  const isActive =
    formData.get("is_active") === "true";

  if (!id) {
    return {
      success: false,
      error: "Brand ID is required.",
    };
  }

  if (!name) {
    return {
      success: false,
      error: "Brand name is required.",
    };
  }

  const slug = createSlug(name);

  const { error } = await supabase
    .from("brands")
    .update({
      name,
      slug,
      description: description || null,
      logo_url: logoUrl || null,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error:
          "A brand with this name already exists.",
      };
    }

    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
}

export async function deleteBrand(
  id: string
): Promise<BrandActionResult> {
  const supabase = await createClient();

  if (!id) {
    return {
      success: false,
      error: "Brand ID is required.",
    };
  }

  const { error } = await supabase
    .from("brands")
    .delete()
    .eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return {
        success: false,
        error:
          "This brand is already used by a product and cannot be deleted.",
      };
    }

    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
}