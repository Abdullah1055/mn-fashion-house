"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type ProductImageActionResult = {
  success: boolean;
  error?: string;
};

const MAX_IMAGES_PER_PRODUCT = 3;

/*
 * The client compresses images to approximately
 * 300 KB before upload.
 *
 * This server-side limit is intentionally kept
 * higher so minor compression differences do not
 * cause a valid upload to fail.
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

/* =========================================================
   UPLOAD PRODUCT IMAGES
========================================================= */

export async function uploadProductImages(
  productId: string,
  formData: FormData
): Promise<ProductImageActionResult> {
  const supabase =
    await createClient();

  if (!productId) {
    return {
      success: false,
      error: "Product ID is required.",
    };
  }

  const files =
    formData.getAll("files");

  const imageFiles =
    files.filter(
      (file): file is File =>
        file instanceof File &&
        file.size > 0
    );

  if (imageFiles.length === 0) {
    return {
      success: false,
      error:
        "Please select at least one image.",
    };
  }

  /*
   * Server-side upload count validation.
   *
   * Never rely only on the client-side UI.
   */

  if (
    imageFiles.length >
    MAX_IMAGES_PER_PRODUCT
  ) {
    return {
      success: false,
      error:
        "You can upload a maximum of 3 images at a time.",
    };
  }

  /* =======================================================
     FILE VALIDATION
  ======================================================== */

  for (const file of imageFiles) {
    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      return {
        success: false,
        error:
          "Each image must be 5 MB or smaller.",
      };
    }

    if (
      !ALLOWED_TYPES.includes(
        file.type
      )
    ) {
      return {
        success: false,
        error:
          "Only JPG, PNG and WebP images are allowed.",
      };
    }
  }

  /* =======================================================
     PRODUCT CHECK
  ======================================================== */

  const { data: product } =
    await supabase
      .from("products")
      .select("id, name")
      .eq("id", productId)
      .maybeSingle();

  if (!product) {
    return {
      success: false,
      error: "Product not found.",
    };
  }

  /* =======================================================
     EXISTING IMAGES
  ======================================================== */

  const {
    data: existingImages,
    error:
      existingImagesError,
  } = await supabase
    .from("product_images")
    .select(
      "id, is_primary, sort_order"
    )
    .eq("product_id", productId)
    .order("sort_order", {
      ascending: false,
    });

  if (existingImagesError) {
    return {
      success: false,
      error:
        existingImagesError.message,
    };
  }

  const existingCount =
    existingImages?.length ?? 0;

  /*
   * Product maximum = 3 images.
   */

  if (
    existingCount +
      imageFiles.length >
    MAX_IMAGES_PER_PRODUCT
  ) {
    const remainingSlots =
      Math.max(
        0,
        MAX_IMAGES_PER_PRODUCT -
          existingCount
      );

    if (remainingSlots === 0) {
      return {
        success: false,
        error:
          "This product already has 3 images. Delete an existing image before uploading another.",
      };
    }

    return {
      success: false,
      error:
        `This product already has ${existingCount} image${
          existingCount === 1
            ? ""
            : "s"
        }. You can upload only ${remainingSlots} more image${
          remainingSlots === 1
            ? ""
            : "s"
        }.`,
    };
  }

  /* =======================================================
     SORT ORDER
  ======================================================== */

  let nextSortOrder =
    existingCount > 0
      ? (
          existingImages?.[0]
            ?.sort_order ?? 0
        ) + 1
      : 0;

  const hasPrimaryImage =
    existingImages?.some(
      (image) =>
        image.is_primary
    ) ?? false;

  const uploadedStoragePaths: string[] =
    [];

  const insertedImageIds: string[] =
    [];

  /* =======================================================
     UPLOAD
  ======================================================== */

  try {
    for (
      let index = 0;
      index < imageFiles.length;
      index++
    ) {
      const file =
        imageFiles[index];

      /*
       * Client-side compression converts
       * selected images to WebP.
       *
       * We still support JPG/PNG/WebP
       * in case the action is called
       * independently.
       */

      const extension =
        file.type ===
        "image/webp"
          ? "webp"
          : file.type ===
              "image/png"
            ? "png"
            : "jpg";

      const fileName =
        `${crypto.randomUUID()}.${extension}`;

      const storagePath =
        `${productId}/${fileName}`;

      /* =====================================================
         STORAGE UPLOAD
      ====================================================== */

      const {
        error: uploadError,
      } = await supabase.storage
        .from("product-images")
        .upload(
          storagePath,
          file,
          {
            contentType:
              file.type,
            upsert: false,
          }
        );

      if (uploadError) {
        throw new Error(
          uploadError.message
        );
      }

      uploadedStoragePaths.push(
        storagePath
      );

      /* =====================================================
         PUBLIC URL
      ====================================================== */

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("product-images")
        .getPublicUrl(
          storagePath
        );

      /* =====================================================
         PRIMARY IMAGE
      ====================================================== */

      const shouldBePrimary =
        !hasPrimaryImage &&
        index === 0;

      /* =====================================================
         DATABASE INSERT
      ====================================================== */

      const {
        data: insertedImage,
        error:
          insertError,
      } = await supabase
        .from("product_images")
        .insert({
          product_id:
            productId,

          image_url:
            publicUrlData.publicUrl,

          storage_path:
            storagePath,

          alt_text:
            product.name,

          is_primary:
            shouldBePrimary,

          sort_order:
            nextSortOrder,
        })
        .select("id")
        .single();

      if (insertError) {
        throw new Error(
          insertError.message
        );
      }

      if (insertedImage) {
        insertedImageIds.push(
          insertedImage.id
        );
      }

      nextSortOrder++;
    }
  } catch (error) {
    /*
     * Rollback storage files if
     * database/storage operation
     * fails during the upload.
     */

    if (
      uploadedStoragePaths.length >
      0
    ) {
      await supabase.storage
        .from("product-images")
        .remove(
          uploadedStoragePaths
        );
    }

    /*
     * Remove any partially inserted
     * database rows as well.
     */

    if (
      insertedImageIds.length >
      0
    ) {
      await supabase
        .from("product_images")
        .delete()
        .in(
          "id",
          insertedImageIds
        );
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to upload images.",
    };
  }

  /* =======================================================
     CACHE REVALIDATION
  ======================================================== */

  revalidatePath(
    `/admin/products/${productId}/images`
  );

  revalidatePath(
    `/admin/products/${productId}/images/gallery`
  );

  revalidatePath(
    "/admin/products"
  );

  return {
    success: true,
  };
}

/* =========================================================
   SET PRIMARY PRODUCT IMAGE
========================================================= */

export async function setPrimaryProductImage(
  productId: string,
  imageId: string
): Promise<ProductImageActionResult> {
  const supabase =
    await createClient();

  if (
    !productId ||
    !imageId
  ) {
    return {
      success: false,
      error:
        "Product and image are required.",
    };
  }

  const { data: image } =
    await supabase
      .from("product_images")
      .select(
        "id, storage_path"
      )
      .eq("id", imageId)
      .eq(
        "product_id",
        productId
      )
      .maybeSingle();

  if (!image) {
    return {
      success: false,
      error:
        "Product image not found.",
    };
  }

  /* =======================================================
     RESET ALL PRIMARY FLAGS
  ======================================================== */

  const {
    error: resetError,
  } = await supabase
    .from("product_images")
    .update({
      is_primary: false,
      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "product_id",
      productId
    );

  if (resetError) {
    return {
      success: false,
      error:
        resetError.message,
    };
  }

  /* =======================================================
     SET SELECTED IMAGE PRIMARY
  ======================================================== */

  const {
    error: primaryError,
  } = await supabase
    .from("product_images")
    .update({
      is_primary: true,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", imageId)
    .eq(
      "product_id",
      productId
    );

  if (primaryError) {
    return {
      success: false,
      error:
        primaryError.message,
    };
  }

  /* =======================================================
     CACHE REVALIDATION
  ======================================================== */

  revalidatePath(
    `/admin/products/${productId}/images`
  );

  revalidatePath(
    `/admin/products/${productId}/images/gallery`
  );

  revalidatePath(
    "/admin/products"
  );

  return {
    success: true,
  };
}

/* =========================================================
   DELETE PRODUCT IMAGE
========================================================= */

export async function deleteProductImage(
  productId: string,
  imageId: string
): Promise<ProductImageActionResult> {
  const supabase =
    await createClient();

  if (
    !productId ||
    !imageId
  ) {
    return {
      success: false,
      error:
        "Product and image are required.",
    };
  }

  /* =======================================================
     GET IMAGE
  ======================================================== */

  const { data: image } =
    await supabase
      .from("product_images")
      .select(
        "id, storage_path, is_primary"
      )
      .eq("id", imageId)
      .eq(
        "product_id",
        productId
      )
      .maybeSingle();

  if (!image) {
    return {
      success: false,
      error:
        "Product image not found.",
    };
  }

  /* =======================================================
     DELETE DATABASE RECORD
  ======================================================== */

  const {
    error: deleteError,
  } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId)
    .eq(
      "product_id",
      productId
    );

  if (deleteError) {
    return {
      success: false,
      error:
        deleteError.message,
    };
  }

  /* =======================================================
     DELETE STORAGE FILE
  ======================================================== */

  const {
    error: storageError,
  } = await supabase.storage
    .from("product-images")
    .remove([
      image.storage_path,
    ]);

  /*
   * The database record has already
   * been deleted. Report the storage
   * problem clearly instead of hiding it.
   */

  if (storageError) {
    return {
      success: false,
      error:
        `Image record deleted, but storage cleanup failed: ${storageError.message}`,
    };
  }

  /* =======================================================
     PRIMARY IMAGE HANDLING
  ======================================================== */

  if (image.is_primary) {
    const {
      data: nextImage,
    } = await supabase
      .from("product_images")
      .select("id")
      .eq(
        "product_id",
        productId
      )
      .order("sort_order", {
        ascending: true,
      })
      .order("created_at", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle();

    if (nextImage) {
      await supabase
        .from("product_images")
        .update({
          is_primary: true,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          nextImage.id
        );
    }
  }

  /* =======================================================
     CACHE REVALIDATION
  ======================================================== */

  revalidatePath(
    `/admin/products/${productId}/images`
  );

  revalidatePath(
    `/admin/products/${productId}/images/gallery`
  );

  revalidatePath(
    "/admin/products"
  );

  return {
    success: true,
  };
}