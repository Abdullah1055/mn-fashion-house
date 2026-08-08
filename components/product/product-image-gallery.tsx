"use client";

import { useState } from "react";
import { Star, Trash2 } from "lucide-react";

import {
  deleteProductImage,
  setPrimaryProductImage,
} from "@/lib/actions/product-image-gallery";

import type { ProductImage } from "@/types/product-image";

type ProductImageGalleryProps = {
  productId: string;
  images: ProductImage[];
};

export function ProductImageGallery({
  productId,
  images,
}: ProductImageGalleryProps) {
  const [loadingId, setLoadingId] =
    useState<string | null>(null);

  async function handlePrimary(
    imageId: string
  ) {
    try {
      setLoadingId(imageId);

      await setPrimaryProductImage(
        productId,
        imageId
      );
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete(
    image: ProductImage
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoadingId(image.id);

      await deleteProductImage(
        productId,
        image.id,
        image.image_url
      );
    } finally {
      setLoadingId(null);
    }
  }

  if (images.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center text-neutral-500">
        No product images uploaded yet.
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {images.map((image) => {
        const loading = loadingId === image.id;

        return (
          <div
            key={image.id}
            className="overflow-hidden rounded-2xl border bg-white shadow-sm"
          >
            <div className="relative aspect-square overflow-hidden bg-neutral-100">
              <img
                src={image.image_url}
                alt={
                  image.alt_text ||
                  "Product image"
                }
                className="h-full w-full object-cover"
              />

              {image.is_primary && (
                <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold shadow">
                  <Star
                    size={13}
                    className="fill-current"
                  />
                  Primary
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 p-4">
              <button
                type="button"
                disabled={
                  loading || image.is_primary
                }
                onClick={() =>
                  handlePrimary(image.id)
                }
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Star size={16} />

                {image.is_primary
                  ? "Primary"
                  : "Set Primary"}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  handleDelete(image)
                }
                className="rounded-lg border p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                title="Delete image"
              >
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}