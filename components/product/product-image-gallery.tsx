"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Save,
  Star,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  deleteProductImage,
  reorderProductImages,
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
  const router = useRouter();

  const [localImages, setLocalImages] =
    useState<ProductImage[]>(images);

  const [loadingId, setLoadingId] =
    useState<string | null>(null);

  const [savingOrder, setSavingOrder] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  function moveImage(
    index: number,
    direction: "up" | "down"
  ) {
    const newIndex =
      direction === "up"
        ? index - 1
        : index + 1;

    if (
      newIndex < 0 ||
      newIndex >= localImages.length
    ) {
      return;
    }

    const updatedImages = [
      ...localImages,
    ];

    const current =
      updatedImages[index];

    updatedImages[index] =
      updatedImages[newIndex];

    updatedImages[newIndex] =
      current;

    setLocalImages(
      updatedImages.map(
        (image, position) => ({
          ...image,
          sort_order: position,
        })
      )
    );

    setMessage(null);
    setError(null);
  }

  async function handleSaveOrder() {
    setSavingOrder(true);
    setMessage(null);
    setError(null);

    try {
      const imageIds =
        localImages.map(
          (image) => image.id
        );

      const result =
        await reorderProductImages(
          productId,
          imageIds
        );

      if (!result.success) {
        setError(
          result.error ||
            "Unable to save image order."
        );

        return;
      }

      setMessage(
        "Image order saved successfully."
      );

      router.refresh();
    } catch {
      setError(
        "Something went wrong while saving image order."
      );
    } finally {
      setSavingOrder(false);
    }
  }

  async function handlePrimary(
    imageId: string
  ) {
    try {
      setLoadingId(imageId);
      setMessage(null);
      setError(null);

      await setPrimaryProductImage(
        productId,
        imageId
      );

      setMessage(
        "Primary image updated successfully."
      );

      router.refresh();
    } catch {
      setError(
        "Unable to update primary image."
      );
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete(
    image: ProductImage
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this image?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setLoadingId(image.id);
      setMessage(null);
      setError(null);

      await deleteProductImage(
        productId,
        image.id,
        image.image_url
      );

      setMessage(
        "Image deleted successfully."
      );

      router.refresh();
    } catch {
      setError(
        "Unable to delete image."
      );
    } finally {
      setLoadingId(null);
    }
  }

  if (localImages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-white px-6 py-16 text-center">
        <p className="font-medium text-neutral-700">
          No product images uploaded yet.
        </p>

        <p className="mt-1 text-sm text-neutral-500">
          Upload product images to
          create the gallery.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Gallery Images
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Arrange your product images
            in the preferred display order.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveOrder}
          disabled={savingOrder}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={16} />

          {savingOrder
            ? "Saving..."
            : "Save Order"}
        </button>
      </div>

      {/* Messages */}

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Gallery */}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {localImages.map(
          (image, index) => {
            const loading =
              loadingId === image.id;

            const isFirst =
              index === 0;

            const isLast =
              index ===
              localImages.length - 1;

            return (
              <div
                key={image.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              >
                {/* Image */}

                <div className="relative aspect-square overflow-hidden bg-neutral-100">
                  <img
                    src={image.image_url}
                    alt={
                      image.alt_text ||
                      "Product image"
                    }
                    className="h-full w-full object-cover"
                  />

                  {/* Position */}

                  <div className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
                    #{index + 1}
                  </div>

                  {/* Primary */}

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

                {/* Controls */}

                <div className="space-y-3 p-4">
                  {/* Reorder */}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={
                        savingOrder ||
                        isFirst
                      }
                      onClick={() =>
                        moveImage(
                          index,
                          "up"
                        )
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                      title="Move image up"
                    >
                      <ArrowUp
                        size={15}
                      />
                      Up
                    </button>

                    <button
                      type="button"
                      disabled={
                        savingOrder ||
                        isLast
                      }
                      onClick={() =>
                        moveImage(
                          index,
                          "down"
                        )
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                      title="Move image down"
                    >
                      <ArrowDown
                        size={15}
                      />
                      Down
                    </button>
                  </div>

                  {/* Primary + Delete */}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={
                        loading ||
                        image.is_primary
                      }
                      onClick={() =>
                        handlePrimary(
                          image.id
                        )
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Star
                        size={15}
                      />

                      {image.is_primary
                        ? "Primary"
                        : "Set Primary"}
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        handleDelete(
                          image
                        )
                      }
                      className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      title="Delete image"
                    >
                      <Trash2
                        size={17}
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}