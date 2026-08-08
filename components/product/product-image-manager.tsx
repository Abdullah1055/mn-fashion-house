"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { uploadProductImages } from "@/lib/actions/product-image";

function UploadButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-sky-600 px-5 py-3 font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Uploading..." : "Upload Images"}
    </button>
  );
}

type ProductImageManagerProps = {
  productId: string;
};

export function ProductImageManager({
  productId,
}: ProductImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [previewUrls, setPreviewUrls] =
    useState<string[]>([]);

  function handleFiles(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files ?? []
    );

    const urls = files.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviewUrls(urls);
  }

  return (
    <div className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">
          Product Images
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          Upload product images. Maximum 5MB per image.
        </p>
      </div>

      <form
        action={async (formData) => {
          await uploadProductImages(
            productId,
            formData
          );

          setPreviewUrls([]);

          if (inputRef.current) {
            inputRef.current.value = "";
          }
        }}
        className="space-y-5"
      >
        <div>
          <label className="mb-2 block text-sm font-medium">
            Select Images
          </label>

          <input
            ref={inputRef}
            name="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            className="block w-full rounded-lg border border-neutral-300 p-3 text-sm"
          />
        </div>

        {previewUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {previewUrls.map((url, index) => (
              <div
                key={url}
                className="overflow-hidden rounded-xl border"
              >
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="aspect-square w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <UploadButton />
      </form>
    </div>
  );
}