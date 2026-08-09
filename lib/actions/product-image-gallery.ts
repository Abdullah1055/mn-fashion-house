"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

const BUCKET_NAME = "product-images";

export async function setPrimaryProductImage(
  productId: string,
  imageId: string
) {
  const supabase = await createClient();

  const { error: resetError } = await supabase
    .from("product_images")
    .update({
      is_primary: false,
    })
    .eq("product_id", productId);

  if (resetError) {
    throw new Error(resetError.message);
  }

  const { error } = await supabase
    .from("product_images")
    .update({
      is_primary: true,
    })
    .eq("id", imageId)
    .eq("product_id", productId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(
    `/admin/products/${productId}/images/gallery`
  );
}

export async function deleteProductImage(
  productId: string,
  imageId: string,
  imageUrl: string
) {
  const supabase = await createClient();

  const { data: image, error: imageError } =
    await supabase
      .from("product_images")
      .select("id, image_url, is_primary")
      .eq("id", imageId)
      .eq("product_id", productId)
      .single();

  if (imageError || !image) {
    throw new Error("Product image not found.");
  }

  const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;

  const markerIndex = imageUrl.indexOf(marker);

  if (markerIndex === -1) {
    throw new Error("Invalid product image URL.");
  }

  const filePath = imageUrl.substring(
    markerIndex + marker.length
  );

  const { error: storageError } =
    await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

  if (storageError) {
    throw new Error(storageError.message);
  }

  const { error: deleteError } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId)
    .eq("product_id", productId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (image.is_primary) {
    const { data: nextImage } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", productId)
      .order("sort_order", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle();

    if (nextImage) {
      await supabase
        .from("product_images")
        .update({
          is_primary: true,
        })
        .eq("id", nextImage.id);
    }
  }

  revalidatePath(
    `/admin/products/${productId}/images/gallery`
  );
}
export async function reorderProductImages(
  productId: string,
  imageIds: string[]
): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();

  if (!productId) {
    return {
      success: false,
      error: "Product ID is required.",
    };
  }

  if (!imageIds.length) {
    return {
      success: false,
      error: "No images provided.",
    };
  }

  const { data: existingImages, error } =
    await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", productId);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  const existingIds = new Set(
    existingImages.map(
      (image) => image.id
    )
  );

  const allImagesBelongToProduct =
    imageIds.every((id) =>
      existingIds.has(id)
    );

  if (!allImagesBelongToProduct) {
    return {
      success: false,
      error:
        "Invalid image selection.",
    };
  }

  for (
    let index = 0;
    index < imageIds.length;
    index++
  ) {
    const { error: updateError } =
      await supabase
        .from("product_images")
        .update({
          sort_order: index,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", imageIds[index])
        .eq("product_id", productId);

    if (updateError) {
      return {
        success: false,
        error:
          updateError.message,
      };
    }
  }

  revalidatePath(
    `/admin/products/${productId}/images`
  );

  revalidatePath(
    `/admin/products/${productId}/images/gallery`
  );

  return {
    success: true,
  };
}