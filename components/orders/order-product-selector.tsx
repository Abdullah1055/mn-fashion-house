"use client";

import { useState } from "react";

type ProductOption = {
  id: string;
  name: string;
  sku: string | null;
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
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");

  function addProduct() {
    if (!productId) return;

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty <= 0) {
      return;
    }

    const product = products.find(
      (item) => item.id === productId
    );

    if (!product || product.stock_quantity < qty) {
      return;
    }

    const existing = value.find(
      (item) => item.product_id === productId
    );

    if (existing) {
      const newQuantity =
        existing.quantity + qty;

      if (newQuantity > product.stock_quantity) {
        return;
      }

      onChange(
        value.map((item) =>
          item.product_id === productId
            ? {
                ...item,
                quantity: newQuantity,
              }
            : item
        )
      );
    } else {
      onChange([
        ...value,
        {
          product_id: productId,
          quantity: qty,
        },
      ]);
    }

    setProductId("");
    setQuantity("1");
  }

  function removeProduct(id: string) {
    onChange(
      value.filter(
        (item) => item.product_id !== id
      )
    );
  }

  function updateQuantity(
    id: string,
    quantity: number
  ) {
    const product = products.find(
      (item) => item.id === id
    );

    if (!product) return;

    if (
      quantity < 1 ||
      quantity > product.stock_quantity
    ) {
      return;
    }

    onChange(
      value.map((item) =>
        item.product_id === id
          ? { ...item, quantity }
          : item
      )
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-[1fr_120px_auto]">
        <select
          value={productId}
          onChange={(event) =>
            setProductId(event.target.value)
          }
          className="h-11 rounded-lg border px-3"
        >
          <option value="">
            Select product
          </option>

          {products.map((product) => (
            <option
              key={product.id}
              value={product.id}
              disabled={product.stock_quantity <= 0}
            >
              {product.name} — Stock:{" "}
              {product.stock_quantity}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(event) =>
            setQuantity(event.target.value)
          }
          className="h-11 rounded-lg border px-3"
        />

        <button
          type="button"
          onClick={addProduct}
          className="rounded-lg bg-sky-600 px-5 py-2 font-medium text-white hover:bg-sky-700"
        >
          Add Product
        </button>
      </div>

      {value.length > 0 && (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-4 py-3 text-left">
                  Product
                </th>

                <th className="px-4 py-3 text-right">
                  Price
                </th>

                <th className="px-4 py-3 text-center">
                  Quantity
                </th>

                <th className="px-4 py-3 text-right">
                  Total
                </th>

                <th className="px-4 py-3" />
              </tr>
            </thead>

            <tbody>
              {value.map((item) => {
                const product = products.find(
                  (product) =>
                    product.id === item.product_id
                );

                if (!product) return null;

                const price = Number(
                  product.sale_price ??
                    product.regular_price
                );

                const total =
                  price * item.quantity;

                return (
                  <tr
                    key={item.product_id}
                    className="border-t"
                  >
                    <td className="px-4 py-4">
                      <div className="font-medium">
                        {product.name}
                      </div>

                      <div className="text-xs text-neutral-500">
                        {product.sku || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-right">
                      ৳{price.toFixed(2)}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <input
                        type="number"
                        min="1"
                        max={
                          product.stock_quantity
                        }
                        value={item.quantity}
                        onChange={(event) =>
                          updateQuantity(
                            item.product_id,
                            Number(
                              event.target.value
                            )
                          )
                        }
                        className="w-20 rounded-lg border px-3 py-2 text-center"
                      />
                    </td>

                    <td className="px-4 py-4 text-right font-semibold">
                      ৳{total.toFixed(2)}
                    </td>

                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          removeProduct(
                            item.product_id
                          )
                        }
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}