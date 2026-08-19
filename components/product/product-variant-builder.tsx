"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export type ProductVariantInput = {
  id?: string;
  color: string;
  size: string;
  stock_quantity: number;
  sku: string;
};

type ProductVariantBuilderProps = {
  initialVariants?: ProductVariantInput[];
};

const SIZES = [
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
  "Free Size",
];

export function ProductVariantBuilder({
  initialVariants = [],
}: ProductVariantBuilderProps) {
  const [variants, setVariants] =
    useState<ProductVariantInput[]>(
      initialVariants
    );

  const [color, setColor] =
    useState("");

  const [size, setSize] =
    useState("");

  const [quantity, setQuantity] =
    useState("0");

  const [sku, setSku] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    setVariants(initialVariants);
  }, [initialVariants]);

  function addVariant() {
    setError(null);

    const cleanColor =
      color.trim();

    const cleanSize =
      size.trim();

    const stock =
      Number(quantity);

    if (!cleanColor) {
      setError(
        "Please enter a color."
      );
      return;
    }

    if (!cleanSize) {
      setError(
        "Please select a size."
      );
      return;
    }

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError(
        "Quantity must be 0 or greater."
      );
      return;
    }

    const duplicate =
      variants.some(
        (variant) =>
          variant.color
            .trim()
            .toLowerCase() ===
            cleanColor.toLowerCase() &&
          variant.size
            .trim()
            .toLowerCase() ===
            cleanSize.toLowerCase()
      );

    if (duplicate) {
      setError(
        "This color and size combination already exists."
      );
      return;
    }

    setVariants((current) => [
      ...current,
      {
        color: cleanColor,
        size: cleanSize,
        stock_quantity: stock,
        sku: sku.trim(),
      },
    ]);

    setColor("");
    setSize("");
    setQuantity("0");
    setSku("");
  }

  function removeVariant(
    index: number
  ) {
    setVariants((current) =>
      current.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  }

  const totalStock =
    variants.reduce(
      (total, variant) =>
        total +
        Number(
          variant.stock_quantity || 0
        ),
      0
    );

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-neutral-900">
          Product Variants
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          Add colors and sizes with their
          available quantities.
        </p>
      </div>

      {/* =====================================================
          ADD VARIANT
      ====================================================== */}

      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <div className="grid gap-3 md:grid-cols-5">
          {/* Color */}

          <div>
            <label
              htmlFor="variant-color"
              className="mb-1.5 block text-sm font-medium text-neutral-900"
            >
              Color
            </label>

            <input
              id="variant-color"
              value={color}
              onChange={(event) =>
                setColor(
                  event.target.value
                )
              }
              placeholder="Red"
              className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Size */}

          <div>
            <label
              htmlFor="variant-size"
              className="mb-1.5 block text-sm font-medium text-neutral-900"
            >
              Size
            </label>

            <select
              id="variant-size"
              value={size}
              onChange={(event) =>
                setSize(
                  event.target.value
                )
              }
              className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              <option value="">
                Select size
              </option>

              {SIZES.map(
                (itemSize) => (
                  <option
                    key={itemSize}
                    value={itemSize}
                  >
                    {itemSize}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Quantity */}

          <div>
            <label
              htmlFor="variant-quantity"
              className="mb-1.5 block text-sm font-medium text-neutral-900"
            >
              Quantity
            </label>

            <input
              id="variant-quantity"
              type="number"
              min="0"
              step="1"
              value={quantity}
              onChange={(event) =>
                setQuantity(
                  event.target.value
                )
              }
              className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* SKU */}

          <div>
            <label
              htmlFor="variant-sku"
              className="mb-1.5 block text-sm font-medium text-neutral-900"
            >
              Variant SKU
            </label>

            <input
              id="variant-sku"
              value={sku}
              onChange={(event) =>
                setSku(
                  event.target.value
                )
              }
              placeholder="Optional"
              className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Add */}

          <div className="flex items-end">
            <button
              type="button"
              onClick={addVariant}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 text-sm font-medium text-white transition hover:bg-sky-700"
            >
              <Plus size={17} />
              Add Variant
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* =====================================================
          VARIANT LIST
      ====================================================== */}

      <div className="mt-5 overflow-hidden rounded-xl border border-neutral-200">
        <div className="flex items-center justify-between border-b bg-neutral-50 px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">
              Added Variants
            </h3>

            <p className="mt-0.5 text-xs text-neutral-500">
              {variants.length} variant
              {variants.length === 1
                ? ""
                : "s"}
            </p>
          </div>

          <div className="text-sm font-semibold text-neutral-700">
            Total Stock: {totalStock}
          </div>
        </div>

        {variants.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-neutral-500">
              No variants added yet.
            </p>

            <p className="mt-1 text-xs text-neutral-400">
              Add a color, size and quantity
              above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead className="bg-white">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Color
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Size
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    SKU
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Quantity
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {variants.map(
                  (
                    variant,
                    index
                  ) => (
                    <tr
                      key={`${variant.id ?? "new"}-${index}`}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                        {variant.color}
                      </td>

                      <td className="px-4 py-3 text-sm text-neutral-700">
                        {variant.size}
                      </td>

                      <td className="px-4 py-3 text-sm text-neutral-500">
                        {variant.sku ||
                          "-"}
                      </td>

                      <td className="px-4 py-3 text-center text-sm font-semibold text-neutral-900">
                        {variant.stock_quantity}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            removeVariant(
                              index
                            )
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                          aria-label="Remove variant"
                        >
                          <Trash2
                            size={16}
                          />
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =====================================================
          HIDDEN DATA
      ====================================================== */}

      <input
        type="hidden"
        name="variant_data"
        value={JSON.stringify(
          variants
        )}
      />

      {/* Keep legacy product stock in sync.
          Backend will calculate it again from variants. */}

      <input
        type="hidden"
        name="stock_quantity"
        value={totalStock}
      />

      {/* Old product-level color/size are
          intentionally left empty. */}

      <input
        type="hidden"
        name="color"
        value=""
      />

      <input
        type="hidden"
        name="size"
        value=""
      />
    </section>
  );
}