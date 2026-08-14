"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export type ProductVariantDraft = {
  id?: string;
  sku: string;
  size: string;
  color: string;
  stock_quantity: number;
  low_stock_threshold: number;
};

type ProductVariantBuilderProps = {
  initialVariants?: ProductVariantDraft[];
};

const SIZES = [
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
];

export function ProductVariantBuilder({
  initialVariants = [],
}: ProductVariantBuilderProps) {
  const [variants, setVariants] =
    useState<ProductVariantDraft[]>(
      initialVariants
    );

  const [color, setColor] =
    useState("");

  const [size, setSize] =
    useState("");

  const [sku, setSku] =
    useState("");

  const [stockQuantity, setStockQuantity] =
    useState("");

  const [
    lowStockThreshold,
    setLowStockThreshold,
  ] = useState("5");

  const [error, setError] =
    useState<string | null>(null);

  function resetFields() {
    setColor("");
    setSize("");
    setSku("");
    setStockQuantity("");
    setLowStockThreshold("5");
    setError(null);
  }

  function addVariant() {
    setError(null);

    const normalizedColor =
      color.trim();

    const normalizedSku =
      sku.trim();

    const stock =
      Number(stockQuantity);

    const lowStock =
      Number(lowStockThreshold);

    if (!normalizedColor) {
      setError(
        "Please enter a color."
      );
      return;
    }

    if (!size) {
      setError(
        "Please select a size."
      );
      return;
    }

    if (!normalizedSku) {
      setError(
        "Please enter a variant SKU."
      );
      return;
    }

    if (
      stockQuantity === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError(
        "Please enter a valid stock quantity."
      );
      return;
    }

    if (
      lowStockThreshold === "" ||
      !Number.isInteger(lowStock) ||
      lowStock < 0
    ) {
      setError(
        "Please enter a valid low stock threshold."
      );
      return;
    }

    const duplicateSku =
      variants.some(
        (variant) =>
          variant.sku.toLowerCase() ===
          normalizedSku.toLowerCase()
      );

    if (duplicateSku) {
      setError(
        "This variant SKU already exists."
      );
      return;
    }

    const duplicateCombination =
      variants.some(
        (variant) =>
          variant.color.toLowerCase() ===
            normalizedColor.toLowerCase() &&
          variant.size === size
      );

    if (duplicateCombination) {
      setError(
        `${normalizedColor} / ${size} variant already exists.`
      );
      return;
    }

    const newVariant: ProductVariantDraft = {
      sku: normalizedSku,
      size,
      color: normalizedColor,
      stock_quantity: stock,
      low_stock_threshold: lowStock,
    };

    setVariants((current) => [
      ...current,
      newVariant,
    ]);

    resetFields();
  }

  function removeVariant(
    index: number
  ) {
    setVariants((current) =>
      current.filter(
        (_, currentIndex) =>
          currentIndex !== index
      )
    );

    setError(null);
  }

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      {/* Header */}

      <div className="mb-5">
        <h2 className="text-lg font-semibold">
          Product Variants
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          Add color, size and stock for
          each product variant.
        </p>
      </div>

      {/* Add Variant */}

      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Color */}

          <div>
            <label
              htmlFor="variant_color"
              className="mb-2 block text-sm font-medium"
            >
              Color
            </label>

            <input
              id="variant_color"
              type="text"
              value={color}
              onChange={(event) =>
                setColor(
                  event.target.value
                )
              }
              placeholder="Navy"
              className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Size */}

          <div>
            <label
              htmlFor="variant_size"
              className="mb-2 block text-sm font-medium"
            >
              Size
            </label>

            <select
              id="variant_size"
              value={size}
              onChange={(event) =>
                setSize(
                  event.target.value
                )
              }
              className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              <option value="">
                Select size
              </option>

              {SIZES.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Variant SKU */}

          <div>
            <label
              htmlFor="variant_sku"
              className="mb-2 block text-sm font-medium"
            >
              Variant SKU
            </label>

            <input
              id="variant_sku"
              type="text"
              value={sku}
              onChange={(event) =>
                setSku(
                  event.target.value
                )
              }
              placeholder="POLO-NAVY-M"
              className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Stock */}

          <div>
            <label
              htmlFor="variant_stock_quantity"
              className="mb-2 block text-sm font-medium"
            >
              Stock Quantity
            </label>

            <input
              id="variant_stock_quantity"
              type="number"
              min="0"
              step="1"
              value={stockQuantity}
              onChange={(event) =>
                setStockQuantity(
                  event.target.value
                )
              }
              placeholder="0"
              className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Low Stock */}

          <div>
            <label
              htmlFor="variant_low_stock_threshold"
              className="mb-2 block text-sm font-medium"
            >
              Low Stock Threshold
            </label>

            <input
              id="variant_low_stock_threshold"
              type="number"
              min="0"
              step="1"
              value={lowStockThreshold}
              onChange={(event) =>
                setLowStockThreshold(
                  event.target.value
                )
              }
              className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>
        </div>

        {/* Error */}

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Add Button */}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700"
          >
            <Plus size={17} />
            Add Variant
          </button>
        </div>
      </div>

      {/* Variant List */}

      {variants.length > 0 && (
        <div className="mt-5 overflow-hidden rounded-xl border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">
                    Color
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Size
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    SKU
                  </th>

                  <th className="px-4 py-3 text-center font-semibold">
                    Stock
                  </th>

                  <th className="px-4 py-3 text-center font-semibold">
                    Low Stock
                  </th>

                  <th className="px-4 py-3 text-center font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {variants.map(
                  (variant, index) => {
                    const isLowStock =
                      variant.stock_quantity <=
                      variant.low_stock_threshold;

                    return (
                      <tr
                        key={
                          variant.id ??
                          `${variant.sku}-${index}`
                        }
                        className="border-t"
                      >
                        <td className="px-4 py-3 font-medium">
                          {variant.color}
                        </td>

                        <td className="px-4 py-3">
                          <span className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-semibold">
                            {variant.size}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          {variant.sku}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span
                            className={
                              isLowStock
                                ? "font-semibold text-red-600"
                                : "font-medium text-neutral-700"
                            }
                          >
                            {
                              variant.stock_quantity
                            }
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          {
                            variant.low_stock_threshold
                          }
                        </td>

                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              removeVariant(
                                index
                              )
                            }
                            className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                            title="Remove variant"
                          >
                            <Trash2
                              size={16}
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Variants submitted with Product Form */}

      <input
        type="hidden"
        name="variants_json"
        value={JSON.stringify(
          variants
        )}
        readOnly
      />
    </section>
  );
}