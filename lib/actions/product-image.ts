"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type ProductImageActionResult = {
  success: boolean;
  error?: string;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function uploadProductImages(
  productId: string,
  formData: FormData
): Promise<ProductImageActionResult> {
  const supabase = await createClient();

  if (!productId) {
    return {
      success: false,
      error: "Product ID is required.",
    };
  }

  const files = formData.getAll("files");

  const imageFiles = files.filter(
    (file): file is File =>
      file instanceof File &&
      file.size > 0
  );

  if (imageFiles.length === 0) {
    return {
      success: false,
      error: "Please select at least one image.",
    };
  }

  for (const file of imageFiles) {
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error:
          "Each image must be 5 MB or smaller.",
      };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        success: false,
        error:
          "Only JPG, PNG and WebP images are allowed.",
      };
    }
  }

  const { data: product } = await supabase
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

  const { data: existingImages } =
    await supabase
      .from("product_images")
      .select(
        "id, is_primary, sort_order"
      )
      .eq("product_id", productId)
      .order("sort_order", {
        ascending: false,
      });

  let nextSortOrder =
    existingImages &&
    existingImages.length > 0
      ? existingImages[0].sort_order + 1
      : 0;

  const hasPrimaryImage =
    existingImages?.some(
      (image) => image.is_primary
    ) ?? false;

  const uploadedStoragePaths: string[] = [];

  try {
    for (const file of imageFiles) {
      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const fileName =
        `${crypto.randomUUID()}.${extension}`;

      const storagePath =
        `${productId}/${fileName}`;

      const { error: uploadError } =
        await supabase.storage
          .from("product-images")
          .upload(
            storagePath,
            file,
            {
              contentType: file.type,
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

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("product-images")
        .getPublicUrl(
          storagePath
        );

      const shouldBePrimary =
        !hasPrimaryImage &&
        uploadedStoragePaths.length === 1;

      const { error: insertError } =
        await supabase
          .from("product_images")
          .insert({
            product_id: productId,
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
          });

      if (insertError) {
        throw new Error(
          insertError.message
        );
      }

      nextSortOrder++;
    }
  } catch (error) {
    if (
      uploadedStoragePaths.length > 0
    ) {
      await supabase.storage
        .from("product-images")
        .remove(
          uploadedStoragePaths
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
export async function setPrimaryProductImage(
  productId: string,
  imageId: string
): Promise<ProductImageActionResult> {
  const supabase = await createClient();

  if (!productId || !imageId) {
    return {
      success: false,
      error: "Product and image are required.",
    };
  }

  const { data: image } = await supabase
    .from("product_images")
    .select("id, storage_path")
    .eq("id", imageId)
    .eq("product_id", productId)
    .maybeSingle();

  if (!image) {
    return {
      success: false,
      error: "Product image not found.",
    };
  }

  const { error: resetError } =
    await supabase
      .from("product_images")
      .update({
        is_primary: false,
        updated_at: new Date().toISOString(),
      })
      .eq("product_id", productId);

  if (resetError) {
    return {
      success: false,
      error: resetError.message,
    };
  }

  const { error: primaryError } =
    await supabase
      .from("product_images")
      .update({
        is_primary: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", imageId)
      .eq("product_id", productId);

  if (primaryError) {
    return {
      success: false,
      error: primaryError.message,
    };
  }

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

export async function deleteProductImage(
  productId: string,
  imageId: string
): Promise<ProductImageActionResult> {
  const supabase = await createClient();

  if (!productId || !imageId) {
    return {
      success: false,
      error: "Product and image are required.",
    };
  }

  const { data: image } =
    await supabase
      .from("product_images")
      .select(
        "id, storage_path, is_primary"
      )
      .eq("id", imageId)
      .eq("product_id", productId)
      .maybeSingle();

  if (!image) {
    return {
      success: false,
      error: "Product image not found.",
    };
  }

  const { error: deleteError } =
    await supabase
      .from("product_images")
      .delete()
      .eq("id", imageId)
      .eq("product_id", productId);

  if (deleteError) {
    return {
      success: false,
      error: deleteError.message,
    };
  }

  const { error: storageError } =
    await supabase.storage
      .from("product-images")
      .remove([
        image.storage_path,
      ]);

  if (storageError) {
    return {
      success: false,
      error:
        `Image record deleted, but storage cleanup failed: ${storageError.message}`,
    };
  }

  /*
   * If the deleted image was primary,
   * automatically promote the first
   * remaining image.
   */

  if (image.is_primary) {
    const { data: nextImage } =
      await supabase
        .from("product_images")
        .select("id")
        .eq("product_id", productId)
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
        .eq("id", nextImage.id);
    }
  }

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