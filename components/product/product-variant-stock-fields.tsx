"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export type ProductColorVariant = {
  color: string;
  sizes: {
    size: string;
    quantity: number;
  }[];
};

type ProductVariantStockFieldsProps = {
  defaultValue?: ProductColorVariant[];
};

const DEFAULT_SIZES = [
  "S",
  "M",
  "L",
  "XL",
  "XXL",
];

export function ProductVariantStockFields({
  defaultValue = [],
}: ProductVariantStockFieldsProps) {
  const [variants, setVariants] =
    useState<ProductColorVariant[]>(
      defaultValue.length > 0
        ? defaultValue
        : [
            {
              color: "",
              sizes: [
                {
                  size: "S",
                  quantity: 0,
                },
              ],
            },
          ]
    );

  function updateColor(
    colorIndex: number,
    value: string
  ) {
    setVariants((current) =>
      current.map((variant, index) =>
        index === colorIndex
          ? {
              ...variant,
              color: value,
            }
          : variant
      )
    );
  }

  function addColor() {
    setVariants((current) => [
      ...current,
      {
        color: "",
        sizes: [
          {
            size: "S",
            quantity: 0,
          },
        ],
      },
    ]);
  }

  function removeColor(
    colorIndex: number
  ) {
    setVariants((current) =>
      current.filter(
        (_, index) =>
          index !== colorIndex
      )
    );
  }

  function addSize(
    colorIndex: number
  ) {
    setVariants((current) =>
      current.map((variant, index) => {
        if (index !== colorIndex) {
          return variant;
        }

        const usedSizes =
          new Set(
            variant.sizes.map(
              (item) => item.size
            )
          );

        const nextSize =
          DEFAULT_SIZES.find(
            (size) =>
              !usedSizes.has(size)
          );

        return {
          ...variant,
          sizes: [
            ...variant.sizes,
            {
              size:
                nextSize || "",
              quantity: 0,
            },
          ],
        };
      })
    );
  }

  function removeSize(
    colorIndex: number,
    sizeIndex: number
  ) {
    setVariants((current) =>
      current.map((variant, index) => {
        if (index !== colorIndex) {
          return variant;
        }

        return {
          ...variant,
          sizes:
            variant.sizes.filter(
              (_, index) =>
                index !== sizeIndex
            ),
        };
      })
    );
  }

  function updateSize(
    colorIndex: number,
    sizeIndex: number,
    value: string
  ) {
    setVariants((current) =>
      current.map((variant, index) => {
        if (index !== colorIndex) {
          return variant;
        }

        return {
          ...variant,
          sizes:
            variant.sizes.map(
              (sizeItem, index) =>
                index === sizeIndex
                  ? {
                      ...sizeItem,
                      size: value,
                    }
                  : sizeItem
            ),
        };
      })
    );
  }

  function updateQuantity(
    colorIndex: number,
    sizeIndex: number,
    value: string
  ) {
    const quantity = Math.max(
      0,
      Number(value) || 0
    );

    setVariants((current) =>
      current.map((variant, index) => {
        if (index !== colorIndex) {
          return variant;
        }

        return {
          ...variant,
          sizes:
            variant.sizes.map(
              (sizeItem, index) =>
                index === sizeIndex
                  ? {
                      ...sizeItem,
                      quantity,
                    }
                  : sizeItem
            ),
        };
      })
    );
  }

  return (
    <div className="space-y-6">
      {variants.map(
        (variant, colorIndex) => (
          <div
            key={colorIndex}
            className="rounded-xl border border-neutral-200 bg-neutral-50 p-5"
          >
            {/* COLOR */}
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-neutral-800">
                  Color
                </label>

                <input
                  type="text"
                  value={variant.color}
                  onChange={(event) =>
                    updateColor(
                      colorIndex,
                      event.target.value
                    )
                  }
                  placeholder="Black"
                  className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    removeColor(
                      colorIndex
                    )
                  }
                  className="flex h-11 items-center justify-center rounded-lg border border-red-200 px-4 text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 size={17} />
                </button>
              )}
            </div>

            {/* SIZE + QUANTITY */}
            <div className="mt-5">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-neutral-900">
                  Size & Quantity
                </h4>

                <button
                  type="button"
                  onClick={() =>
                    addSize(colorIndex)
                  }
                  className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  <Plus size={16} />
                  Add Size
                </button>
              </div>

              <div className="space-y-2">
                {variant.sizes.map(
                  (
                    sizeItem,
                    sizeIndex
                  ) => (
                    <div
                      key={sizeIndex}
                      className="grid grid-cols-[1fr_1fr_auto] gap-3"
                    >
                      <select
                        value={
                          sizeItem.size
                        }
                        onChange={(
                          event
                        ) =>
                          updateSize(
                            colorIndex,
                            sizeIndex,
                            event.target.value
                          )
                        }
                        className="h-11 rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      >
                        <option value="">
                          Select Size
                        </option>

                        {DEFAULT_SIZES.map(
                          (size) => (
                            <option
                              key={size}
                              value={size}
                            >
                              {size}
                            </option>
                          )
                        )}
                      </select>

                      <input
                        type="number"
                        min="0"
                        value={
                          sizeItem.quantity
                        }
                        onChange={(
                          event
                        ) =>
                          updateQuantity(
                            colorIndex,
                            sizeIndex,
                            event.target.value
                          )
                        }
                        placeholder="Quantity"
                        className="h-11 rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      />

                      {variant.sizes
                        .length >
                        1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeSize(
                              colorIndex,
                              sizeIndex
                            )
                          }
                          className="flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2
                            size={16}
                          />
                        </button>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )
      )}

      {/* ADD COLOR */}
      <button
        type="button"
        onClick={addColor}
        className="inline-flex h-11 items-center gap-2 rounded-lg border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-800 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
      >
        <Plus size={17} />
        Add Another Color
      </button>

      {/* HIDDEN DATA */}
      <input
        type="hidden"
        name="variant_data"
        value={JSON.stringify(
          variants
        )}
      />
    </div>
  );
}