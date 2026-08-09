"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Trash2, Star, Upload } from "lucide-react";

import {
  deleteProductImage,
  setPrimaryProductImage,
  uploadProductImages,
} from "@/lib/actions/product-image";

import type { ProductImage } from "@/types/product-image";

type ProductImageManagerProps = {
  productId: string;
  images: ProductImage[];
};

export function ProductImageManager({
  productId,
  images,
}: ProductImageManagerProps) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  async function handleUpload(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!inputRef.current?.files?.length) {
      setError(
        "Please select at least one image."
      );

      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const formData = new FormData();

      Array.from(
        inputRef.current.files
      ).forEach((file) => {
        formData.append("files", file);
      });

      const result =
        await uploadProductImages(
          productId,
          formData
        );

      if (!result.success) {
        setError(
          result.error ||
            "Unable to upload images."
        );

        return;
      }

      setMessage(
        "Images uploaded successfully."
      );

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      window.location.reload();
    } catch {
      setError(
        "Something went wrong while uploading."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSetPrimary(
    imageId: string
  ) {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result =
        await setPrimaryProductImage(
          productId,
          imageId
        );

      if (!result.success) {
        setError(
          result.error ||
            "Unable to set primary image."
        );

        return;
      }

      setMessage(
        "Primary image updated."
      );

      window.location.reload();
    } catch {
      setError(
        "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(
    imageId: string
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this image?"
      );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result =
        await deleteProductImage(
          productId,
          imageId
        );

      if (!result.success) {
        setError(
          result.error ||
            "Unable to delete image."
        );

        return;
      }

      setMessage(
        "Image deleted successfully."
      );

      window.location.reload();
    } catch {
      setError(
        "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Upload */}

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">
            Upload Product Images
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            JPG, PNG or WebP. Maximum 5 MB
            per image.
          </p>
        </div>

        <form
          onSubmit={handleUpload}
          className="flex flex-col gap-4 sm:flex-row sm:items-center"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload size={17} />

            {loading
              ? "Processing..."
              : "Upload Images"}
          </button>
        </form>
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

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Product Gallery
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Manage your product images.
          </p>
        </div>

        {images.length === 0 ? (
          <div className="rounded-xl border border-dashed px-6 py-16 text-center">
            <p className="font-medium text-neutral-700">
              No images uploaded yet.
            </p>

            <p className="mt-1 text-sm text-neutral-500">
              Upload product images to
              create the gallery.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="overflow-hidden rounded-xl border bg-white"
              >
                <div className="relative aspect-square bg-neutral-100">
                  <Image
                    src={image.image_url}
                    alt={
                      image.alt_text ||
                      "Product image"
                    }
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />

                  {image.is_primary && (
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white">
                      <Star
                        size={13}
                        fill="currentColor"
                      />
                      Primary
                    </div>
                  )}
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>
                      Position{" "}
                      {image.sort_order + 1}
                    </span>

                    <span>
                      {image.is_primary
                        ? "Main image"
                        : "Gallery"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {!image.is_primary && (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() =>
                          handleSetPrimary(
                            image.id
                          )
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-yellow-50 hover:text-yellow-700 disabled:opacity-50"
                      >
                        <Star size={14} />
                        Set Primary
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        handleDelete(
                          image.id
                        )
                      }
                      className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}