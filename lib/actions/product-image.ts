"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

const BUCKET_NAME = "product-images";

export async function uploadProductImages(
  productId: string,
  formData: FormData
) {
  const supabase = await createClient();

  const files = formData
    .getAll("images")
    .filter(
      (item): item is File =>
        item instanceof File &&
        item.size > 0
    );

  if (files.length === 0) {
    throw new Error("Please select at least one image.");
  }

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      throw new Error(
        `${file.name} is not a valid image.`
      );
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new Error(
        `${file.name} exceeds the 5MB limit.`
      );
    }

    const extension =
      file.name.split(".").pop()?.toLowerCase() ||
      "jpg";

    const fileName = `${crypto.randomUUID()}.${extension}`;

    const filePath = `${productId}/${fileName}`;

    const { error: uploadError } =
      await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const {
      data: publicUrlData,
    } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    const { data: existingImages } =
      await supabase
        .from("product_images")
        .select("id")
        .eq("product_id", productId);

    const sortOrder =
      existingImages?.length ?? 0;

    const { error: databaseError } =
      await supabase
        .from("product_images")
        .insert({
          product_id: productId,
          image_url: publicUrlData.publicUrl,
          alt_text: null,
          is_primary:
            sortOrder === 0,
          sort_order: sortOrder,
        });

    if (databaseError) {
      await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      throw new Error(databaseError.message);
    }
  }

  revalidatePath(
    `/admin/products/${productId}/images`
  );
}