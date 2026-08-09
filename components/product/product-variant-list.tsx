"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import {
  deleteProductVariant,
} from "@/lib/actions/product-variant";

import type { ProductVariant } from "@/types/product-variant";

import { ProductVariantForm } from "./product-variant-form";

type ProductVariantListProps = {
  productId: string;
  variants: ProductVariant[];
};

export function ProductVariantList({
  productId,
  variants,
}: ProductVariantListProps) {
  const [editingVariant, setEditingVariant] =
    useState<ProductVariant | null>(null);

  const [loadingId, setLoadingId] =
    useState<string | null>(null);

  async function handleDelete(
    variant: ProductVariant
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this variant?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setLoadingId(variant.id);

      await deleteProductVariant(
        productId,
        variant.id
      );

      window.location.reload();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to delete variant."
      );
    } finally {
      setLoadingId(null);
    }
  }

  if (editingVariant) {
    return (
      <ProductVariantForm
        productId={productId}
        variant={editingVariant}
        onSuccess={() => {
          setEditingVariant(null);
          window.location.reload();
        }}
        onCancel={() =>
          setEditingVariant(null)
        }
      />
    );
  }

  if (variants.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-white px-6 py-16 text-center">
        <p className="font-medium text-neutral-700">
          No variants added yet.
        </p>

        <p className="mt-1 text-sm text-neutral-500">
          Add size or color variants for
          this product.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-5 py-4 text-left font-semibold">
                Size
              </th>

              <th className="px-5 py-4 text-left font-semibold">
                Color
              </th>

              <th className="px-5 py-4 text-left font-semibold">
                SKU
              </th>

              <th className="px-5 py-4 text-right font-semibold">
                Regular
              </th>

              <th className="px-5 py-4 text-right font-semibold">
                Sale
              </th>

              <th className="px-5 py-4 text-center font-semibold">
                Stock
              </th>

              <th className="px-5 py-4 text-center font-semibold">
                Status
              </th>

              <th className="px-5 py-4 text-center font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {variants.map((variant) => {
              const lowStock =
                variant.stock_quantity <=
                variant.low_stock_threshold;

              return (
                <tr
                  key={variant.id}
                  className="border-t transition hover:bg-neutral-50"
                >
                  <td className="px-5 py-4 font-medium">
                    {variant.size || "-"}
                  </td>

                  <td className="px-5 py-4">
                    {variant.color || "-"}
                  </td>

                  <td className="px-5 py-4">
                    {variant.sku || "-"}
                  </td>

                  <td className="px-5 py-4 text-right">
                    ৳
                    {Number(
                      variant.regular_price || 0
                    ).toFixed(2)}
                  </td>

                  <td className="px-5 py-4 text-right">
                    {variant.sale_price !==
                    null ? (
                      <>
                        ৳
                        {Number(
                          variant.sale_price
                        ).toFixed(2)}
                      </>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="px-5 py-4 text-center">
                    <span
                      className={
                        lowStock
                          ? "font-semibold text-red-600"
                          : "font-medium"
                      }
                    >
                      {variant.stock_quantity}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-center">
                    {variant.is_active ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingVariant(
                            variant
                          )
                        }
                        className="rounded-lg border p-2 transition hover:bg-sky-50 hover:text-sky-600"
                        title="Edit variant"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        disabled={
                          loadingId ===
                          variant.id
                        }
                        onClick={() =>
                          handleDelete(
                            variant
                          )
                        }
                        className="rounded-lg border p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        title="Delete variant"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}