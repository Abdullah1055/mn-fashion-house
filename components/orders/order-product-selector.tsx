"use client";

import { useState } from "react";

type ProductOption = {
  id: string;
  name: string;
  sku: string | null;

  color: string | null;
  size: string | null;

  regular_price: number;
  sale_price: number | null;

  stock_quantity: number;
};

type SelectedItem = {
  product_id: string;
  quantity: number;
};

type Props = {
  products: ProductOption[];
  value: SelectedItem[];
  onChange: (items: SelectedItem[]) => void;
};

export function OrderProductSelector({
  products,
  value,
  onChange,
}: Props) {
  const [productId, setProductId] =
    useState("");

  const [quantity, setQuantity] =
    useState("1");

  function addProduct() {
    if (!productId) return;

    const qty = Number(quantity);

    if (
      !Number.isInteger(qty) ||
      qty <= 0
    ) {
      return;
    }

    const product = products.find(
      (item) =>
        item.id === productId
    );

    if (!product) return;

    if (
      product.stock_quantity < qty
    ) {
      return;
    }

    const existing = value.find(
      (item) =>
        item.product_id === productId
    );

    if (existing) {
      const newQuantity =
        existing.quantity + qty;

      if (
        newQuantity >
        product.stock_quantity
      ) {
        return;
      }

      onChange(
        value.map((item) =>
          item.product_id ===
          productId
            ? {
                ...item,
                quantity:
                  newQuantity,
              }
            : item
        )
      );
    } else {
      onChange([
        ...value,
        {
          product_id:
            productId,
          quantity: qty,
        },
      ]);
    }

    setProductId("");
    setQuantity("1");
  }

  function removeProduct(
    id: string
  ) {
    onChange(
      value.filter(
        (item) =>
          item.product_id !== id
      )
    );
  }

  function updateQuantity(
    id: string,
    newQuantity: number
  ) {
    const product = products.find(
      (item) =>
        item.id === id
    );

    if (!product) return;

    if (
      !Number.isInteger(
        newQuantity
      ) ||
      newQuantity < 1 ||
      newQuantity >
        product.stock_quantity
    ) {
      return;
    }

    onChange(
      value.map((item) =>
        item.product_id === id
          ? {
              ...item,
              quantity:
                newQuantity,
            }
          : item
      )
    );
  }

  const selectedProduct =
    products.find(
      (product) =>
        product.id === productId
    );

  return (
    <div className="space-y-5">
      {/* =====================================================
          PRODUCT SELECTOR
      ====================================================== */}

      <div className="grid gap-4 md:grid-cols-[1.5fr_0.8fr_0.8fr_120px_auto]">
        {/* Product */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Product
          </label>

          <select
            value={productId}
            onChange={(event) =>
              setProductId(
                event.target.value
              )
            }
            className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            <option value="">
              Select product
            </option>

            {products.map(
              (product) => (
                <option
                  key={product.id}
                  value={product.id}
                  disabled={
                    product.stock_quantity <=
                    0
                  }
                >
                  {product.name}
                </option>
              )
            )}
          </select>
        </div>

        {/* Color */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Color
          </label>

          <div className="flex h-11 items-center rounded-lg border border-neutral-300 bg-neutral-50 px-3 text-sm text-neutral-700">
            {selectedProduct?.color ||
              "-"}
          </div>
        </div>

        {/* Size */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Size
          </label>

          <div className="flex h-11 items-center rounded-lg border border-neutral-300 bg-neutral-50 px-3 text-sm text-neutral-700">
            {selectedProduct?.size ||
              "-"}
          </div>
        </div>

        {/* Quantity */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Quantity
          </label>

          <input
            type="number"
            min="1"
            max={
              selectedProduct?.stock_quantity ??
              undefined
            }
            value={quantity}
            onChange={(event) =>
              setQuantity(
                event.target.value
              )
            }
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 text-center outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        {/* Add */}

        <div className="flex items-end">
          <button
            type="button"
            onClick={addProduct}
            disabled={
              !selectedProduct ||
              selectedProduct.stock_quantity <=
                0
            }
            className="h-11 w-full rounded-lg bg-sky-600 px-5 font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      {/* Available Stock */}

      {selectedProduct && (
        <div className="rounded-lg bg-neutral-50 px-4 py-3 text-sm">
          <span className="text-neutral-500">
            Available Stock:
          </span>{" "}
          <span className="font-semibold text-neutral-900">
            {
              selectedProduct.stock_quantity
            }{" "}
            pcs
          </span>

          {selectedProduct.sku && (
            <>
              <span className="mx-3 text-neutral-300">
                |
              </span>

              <span className="text-neutral-500">
                SKU:
              </span>{" "}
              <span className="font-medium">
                {selectedProduct.sku}
              </span>
            </>
          )}
        </div>
      )}

      {/* =====================================================
          CART
      ====================================================== */}

      {value.length > 0 && (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Product
                </th>

                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Color
                </th>

                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Size
                </th>

                <th className="px-4 py-3 text-right text-sm font-semibold">
                  Price
                </th>

                <th className="px-4 py-3 text-center text-sm font-semibold">
                  Quantity
                </th>

                <th className="px-4 py-3 text-right text-sm font-semibold">
                  Total
                </th>

                <th className="px-4 py-3" />
              </tr>
            </thead>

            <tbody>
              {value.map(
                (item) => {
                  const product =
                    products.find(
                      (product) =>
                        product.id ===
                        item.product_id
                    );

                  if (!product) {
                    return null;
                  }

                  const price =
                    Number(
                      product.sale_price ??
                        product.regular_price
                    );

                  const total =
                    price *
                    item.quantity;

                  return (
                    <tr
                      key={
                        item.product_id
                      }
                      className="border-t"
                    >
                      {/* Product */}

                      <td className="px-4 py-4">
                        <div className="font-medium text-neutral-900">
                          {
                            product.name
                          }
                        </div>

                        <div className="mt-1 text-xs text-neutral-500">
                          {product.sku ||
                            "-"}
                        </div>
                      </td>

                      {/* Color */}

                      <td className="px-4 py-4 text-sm text-neutral-600">
                        {product.color ||
                          "-"}
                      </td>

                      {/* Size */}

                      <td className="px-4 py-4 text-sm text-neutral-600">
                        {product.size ||
                          "-"}
                      </td>

                      {/* Price */}

                      <td className="px-4 py-4 text-right text-sm">
                        ৳
                        {price.toFixed(
                          2
                        )}
                      </td>

                      {/* Quantity */}

                      <td className="px-4 py-4 text-center">
                        <input
                          type="number"
                          min="1"
                          max={
                            product.stock_quantity
                          }
                          value={
                            item.quantity
                          }
                          onChange={(
                            event
                          ) =>
                            updateQuantity(
                              item.product_id,
                              Number(
                                event
                                  .target
                                  .value
                              )
                            )
                          }
                          className="w-20 rounded-lg border border-neutral-300 px-3 py-2 text-center outline-none focus:border-sky-500"
                        />

                        <p className="mt-1 text-xs text-neutral-400">
                          Stock:{" "}
                          {
                            product.stock_quantity
                          }
                        </p>
                      </td>

                      {/* Total */}

                      <td className="px-4 py-4 text-right font-semibold">
                        ৳
                        {total.toFixed(
                          2
                        )}
                      </td>

                      {/* Remove */}

                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            removeProduct(
                              item.product_id
                            )
                          }
                          className="text-sm font-medium text-red-600 transition hover:text-red-700"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}