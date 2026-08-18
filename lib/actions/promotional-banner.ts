"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type PromotionalBannerActionResult = {
  success: boolean;
  error?: string;
};

function cleanOptionalValue(
  value: FormDataEntryValue | null
): string | null {
  const text = String(value ?? "").trim();

  return text || null;
}

/* =========================================================
   CREATE PROMOTIONAL BANNER
========================================================= */

export async function createPromotionalBanner(
  formData: FormData
): Promise<PromotionalBannerActionResult> {
  const supabase = await createClient();

  const title = String(
    formData.get("title") ?? ""
  ).trim();

  const description =
    cleanOptionalValue(
      formData.get("description")
    );

  const discountText =
    cleanOptionalValue(
      formData.get("discount_text")
    );

  const imageUrl =
    cleanOptionalValue(
      formData.get("image_url")
    );

  const storagePath =
    cleanOptionalValue(
      formData.get("storage_path")
    );

  const buttonText =
    String(
      formData.get("button_text") ??
        "Shop Now"
    ).trim() || "Shop Now";

  const buttonLink =
    cleanOptionalValue(
      formData.get("button_link")
    );

  const startAt =
    cleanOptionalValue(
      formData.get("start_at")
    );

  const endAt =
    cleanOptionalValue(
      formData.get("end_at")
    );

  const displayOrder =
    Number(
      formData.get("display_order") ??
        0
    );

  const isActive =
    formData.get("is_active") === "on";

  const isDismissible =
    formData.get("is_dismissible") !==
    "off";

  /* --------------------------------
     Validation
  -------------------------------- */

  if (!title) {
    return {
      success: false,
      error: "Banner title is required.",
    };
  }

  if (
    startAt &&
    endAt &&
    new Date(startAt).getTime() >
      new Date(endAt).getTime()
  ) {
    return {
      success: false,
      error:
        "End date must be after the start date.",
    };
  }

  if (
    !Number.isFinite(displayOrder) ||
    displayOrder < 0
  ) {
    return {
      success: false,
      error:
        "Display order must be a valid number.",
    };
  }

  /* --------------------------------
     Insert
  -------------------------------- */

  const { error } = await supabase
    .from("promotional_banners")
    .insert({
      title,
      description,
      discount_text: discountText,
      image_url: imageUrl,
      storage_path: storagePath,
      button_text: buttonText,
      button_link: buttonLink,
      start_at: startAt
        ? new Date(startAt).toISOString()
        : null,
      end_at: endAt
        ? new Date(endAt).toISOString()
        : null,
      is_active: isActive,
      is_dismissible: isDismissible,
      display_order:
        Math.floor(displayOrder),
    });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/admin/offers");
  revalidatePath(
    "/admin/offers/banners"
  );
  revalidatePath("/");

  return {
    success: true,
  };
}

/* =========================================================
   UPDATE PROMOTIONAL BANNER
========================================================= */

export async function updatePromotionalBanner(
  id: string,
  formData: FormData
): Promise<PromotionalBannerActionResult> {
  const supabase = await createClient();

  if (!id) {
    return {
      success: false,
      error: "Banner ID is required.",
    };
  }

  const title = String(
    formData.get("title") ?? ""
  ).trim();

  const description =
    cleanOptionalValue(
      formData.get("description")
    );

  const discountText =
    cleanOptionalValue(
      formData.get("discount_text")
    );

  const imageUrl =
    cleanOptionalValue(
      formData.get("image_url")
    );

  const storagePath =
    cleanOptionalValue(
      formData.get("storage_path")
    );

  const buttonText =
    String(
      formData.get("button_text") ??
        "Shop Now"
    ).trim() || "Shop Now";

  const buttonLink =
    cleanOptionalValue(
      formData.get("button_link")
    );

  const startAt =
    cleanOptionalValue(
      formData.get("start_at")
    );

  const endAt =
    cleanOptionalValue(
      formData.get("end_at")
    );

  const displayOrder =
    Number(
      formData.get("display_order") ??
        0
    );

  const isActive =
    formData.get("is_active") === "on";

  const isDismissible =
    formData.get("is_dismissible") !==
    "off";

  /* --------------------------------
     Validation
  -------------------------------- */

  if (!title) {
    return {
      success: false,
      error: "Banner title is required.",
    };
  }

  if (
    startAt &&
    endAt &&
    new Date(startAt).getTime() >
      new Date(endAt).getTime()
  ) {
    return {
      success: false,
      error:
        "End date must be after the start date.",
    };
  }

  if (
    !Number.isFinite(displayOrder) ||
    displayOrder < 0
  ) {
    return {
      success: false,
      error:
        "Display order must be a valid number.",
    };
  }

  /* --------------------------------
     Update
  -------------------------------- */

  const { error } = await supabase
    .from("promotional_banners")
    .update({
      title,
      description,
      discount_text: discountText,
      image_url: imageUrl,
      storage_path: storagePath,
      button_text: buttonText,
      button_link: buttonLink,
      start_at: startAt
        ? new Date(startAt).toISOString()
        : null,
      end_at: endAt
        ? new Date(endAt).toISOString()
        : null,
      is_active: isActive,
      is_dismissible: isDismissible,
      display_order:
        Math.floor(displayOrder),
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/admin/offers");
  revalidatePath(
    "/admin/offers/banners"
  );
  revalidatePath("/");
  revalidatePath(
    `/admin/offers/banners/${id}`
  );

  return {
    success: true,
  };
}

/* =========================================================
   TOGGLE ACTIVE / INACTIVE
========================================================= */

export async function togglePromotionalBanner(
  id: string,
  isActive: boolean
): Promise<PromotionalBannerActionResult> {
  const supabase = await createClient();

  if (!id) {
    return {
      success: false,
      error: "Banner ID is required.",
    };
  }

  const { error } = await supabase
    .from("promotional_banners")
    .update({
      is_active: isActive,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/admin/offers");
  revalidatePath(
    "/admin/offers/banners"
  );
  revalidatePath("/");

  return {
    success: true,
  };
}

/* =========================================================
   DELETE PROMOTIONAL BANNER
   HARD DELETE:
   1. Find banner
   2. Delete Storage image
   3. Delete DB record
========================================================= */

export async function deletePromotionalBanner(
  id: string
): Promise<PromotionalBannerActionResult> {
  const supabase = await createClient();

  if (!id) {
    return {
      success: false,
      error: "Banner ID is required.",
    };
  }

  /* --------------------------------
     Get banner first
  -------------------------------- */

  const {
    data: banner,
    error: fetchError,
  } = await supabase
    .from("promotional_banners")
    .select(
      "id, storage_path"
    )
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return {
      success: false,
      error: fetchError.message,
    };
  }

  if (!banner) {
    return {
      success: false,
      error: "Promotional banner not found.",
    };
  }

  /* --------------------------------
     Delete Storage image
  -------------------------------- */

  if (banner.storage_path) {
    const {
      error: storageError,
    } = await supabase.storage
      .from("promotional-banners")
      .remove([
        banner.storage_path,
      ]);

    if (storageError) {
      return {
        success: false,
        error:
          `Unable to delete banner image: ${storageError.message}`,
      };
    }
  }

  /* --------------------------------
     Delete Database record
  -------------------------------- */

  const { error: deleteError } =
    await supabase
      .from("promotional_banners")
      .delete()
      .eq("id", id);

  if (deleteError) {
    return {
      success: false,
      error: deleteError.message,
    };
  }

  /* --------------------------------
     Revalidate
  -------------------------------- */

  revalidatePath("/admin/offers");
  revalidatePath(
    "/admin/offers/banners"
  );
  revalidatePath("/");
  revalidatePath(
    `/admin/offers/banners/${id}`
  );

  return {
    success: true,
  };
}