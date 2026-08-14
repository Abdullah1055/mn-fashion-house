"use client";

import { useState } from "react";

import {
  createProductVariant,
  updateProductVariant,
} from "@/lib/actions/product-variant";

import type { ProductVariant } from "@/types/product-variant";

type ProductVariantFormProps = {
  productId: string;
  variant?: ProductVariant;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const STANDARD_SIZES = [
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
  "Free Size",
];

export function ProductVariantForm({
  productId,
  variant,
  onSuccess,
  onCancel,
}: ProductVariantFormProps) {
  const isEdit = Boolean(variant);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(
        event.currentTarget
      );

      if (variant) {
        await updateProductVariant(
          productId,
          variant.id,
          formData
        );
      } else {
        await createProductVariant(
          productId,
          formData
        );
      }

      onSuccess?.();

      if (!variant) {
        event.currentTarget.reset();
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save variant."
      );
    } finally {
      setLoading(false);
    }
  }

  const currentSize = variant?.size || "";

  const sizeOptions =
    currentSize &&
    !STANDARD_SIZES.includes(currentSize)
      ? [currentSize, ...STANDARD_SIZES]
      : STANDARD_SIZES;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm"
    >
      {/* Header */}

      <div>
        <h2 className="text-lg font-semibold">
          {isEdit
            ? "Edit Variant"
            : "Add Variant"}
        </h2>
      </div>

      {/* Variant Information */}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Size */}

        <div>
          <label
            htmlFor="size"
            className="mb-2 block text-sm font-medium"
          >
            Size
          </label>

          <select
            id="size"
            name="size"
            defaultValue={currentSize}
            className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            <option value="">
              Select size
            </option>

            {sizeOptions.map((size) => (
              <option
                key={size}
                value={size}
              >
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Color */}

        <div>
          <label
            htmlFor="color"
            className="mb-2 block text-sm font-medium"
          >
            Color
          </label>

          <input
            id="color"
            name="color"
            defaultValue={
              variant?.color || ""
            }
            placeholder="Black"
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        {/* Variant SKU */}

        <div>
          <label
            htmlFor="sku"
            className="mb-2 block text-sm font-medium"
          >
            Variant SKU
          </label>

          <input
            id="sku"
            name="sku"
            defaultValue={
              variant?.sku || ""
            }
            placeholder="POLO-BLK-M"
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />

          <p className="mt-1.5 text-xs text-neutral-500">
            Use a unique SKU for this variant.
          </p>
        </div>

        {/* Purchase Cost */}

        <div>
          <label
            htmlFor="purchase_cost"
            className="mb-2 block text-sm font-medium"
          >
            Purchase Cost
          </label>

          <input
            id="purchase_cost"
            name="purchase_cost"
            type="number"
            min="0"
            step="0.01"
            defaultValue={
              variant?.purchase_cost ?? 0
            }
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        {/* Regular Price */}

        <div>
          <label
            htmlFor="regular_price"
            className="mb-2 block text-sm font-medium"
          >
            Regular Price
          </label>

          <input
            id="regular_price"
            name="regular_price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={
              variant?.regular_price ?? 0
            }
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        {/* Sale Price */}

        <div>
          <label
            htmlFor="sale_price"
            className="mb-2 block text-sm font-medium"
          >
            Sale Price
          </label>

          <input
            id="sale_price"
            name="sale_price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={
              variant?.sale_price ?? ""
            }
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>
      </div>

      {/* Active Status */}

      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={
              variant?.is_active ?? true
            }
            className="h-4 w-4 rounded border-neutral-300 text-sky-600 focus:ring-sky-500"
          />

          <div>
            <span className="text-sm font-semibold text-neutral-900">
              Active Variant
            </span>

            <p className="mt-0.5 text-xs text-neutral-500">
              Active variants can be available
              for customers to purchase.
            </p>
          </div>
        </label>
      </div>

      {/* Error */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Actions */}

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-medium transition hover:bg-neutral-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : isEdit
              ? "Save Changes"
              : "Add Variant"}
        </button>
      </div>
    </form>
  );
}