"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  createOrder,
  type CreateOrderItemInput,
} from "@/lib/actions/order";

import { OrderProductSelector } from "./order-product-selector";

type ProductOption = {
  id: string;
  name: string;
  sku: string | null;
  regular_price: number;
  sale_price: number | null;
  stock_quantity: number;
};

type Props = {
  products: ProductOption[];
};

export function OrderForm({
  products,
}: Props) {
  const router = useRouter();

  const [items, setItems] = useState<
    CreateOrderItemInput[]
  >([]);

  const [discount, setDiscount] =
    useState("0");

  const [shipping, setShipping] =
    useState("0");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [selectedItems, setSelectedItems] =
    useState<
      {
        product_id: string;
        quantity: number;
      }[]
    >([]);

  const subtotal = selectedItems.reduce(
    (total, item) => {
      const product = products.find(
        (product) =>
          product.id === item.product_id
      );

      if (!product) return total;

      const price = Number(
        product.sale_price ??
          product.regular_price
      );

      return total + price * item.quantity;
    },
    0
  );

  const discountValue =
    Number(discount) || 0;

  const shippingValue =
    Number(shipping) || 0;

  const grandTotal =
    subtotal -
    discountValue +
    shippingValue;

  function handleItemsChange(
    newItems: {
      product_id: string;
      quantity: number;
    }[]
  ) {
    setSelectedItems(newItems);

    setItems(
      newItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }))
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    if (selectedItems.length === 0) {
      setError(
        "Please add at least one product."
      );
      return;
    }

    if (discountValue > subtotal) {
      setError(
        "Discount cannot be greater than subtotal."
      );
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData(
        event.currentTarget
      );

      const result = await createOrder(
        formData,
        items
      );

      if (!result.success) {
        setError(
          result.error ||
            "Unable to create order."
        );
        return;
      }

      router.push(
        `/admin/orders/${result.orderId}`
      );

      router.refresh();
    } catch {
      setError(
        "Something went wrong while creating the order."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* Customer */}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Customer Information
        </h2>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Customer Name
            </label>

            <input
              name="customer_name"
              required
              className="h-11 w-full rounded-lg border px-3"
              placeholder="Customer name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Phone
            </label>

            <input
              name="customer_phone"
              required
              className="h-11 w-full rounded-lg border px-3"
              placeholder="01XXXXXXXXX"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <input
              name="customer_email"
              type="email"
              className="h-11 w-full rounded-lg border px-3"
              placeholder="customer@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Payment Method
            </label>

            <select
              name="payment_method"
              defaultValue="cash_on_delivery"
              className="h-11 w-full rounded-lg border px-3"
            >
              <option value="cash_on_delivery">
                Cash on Delivery
              </option>

              <option value="online">
                Online
              </option>

              <option value="bank_transfer">
                Bank Transfer
              </option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">
              Shipping Address
            </label>

            <textarea
              name="shipping_address"
              rows={3}
              className="w-full rounded-lg border px-3 py-3"
              placeholder="Full delivery address"
            />
          </div>
        </div>
      </section>

      {/* Products */}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Order Products
        </h2>

        <div className="mt-6">
          <OrderProductSelector
            products={products}
            value={selectedItems}
            onChange={handleItemsChange}
          />
        </div>
      </section>

      {/* Summary */}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Order Summary
        </h2>

        <div className="mt-6 max-w-md space-y-5 ml-auto">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Discount
            </label>

            <input
              name="discount_amount"
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(event) =>
                setDiscount(event.target.value)
              }
              className="h-11 w-full rounded-lg border px-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Shipping
            </label>

            <input
              name="shipping_amount"
              type="number"
              min="0"
              step="0.01"
              value={shipping}
              onChange={(event) =>
                setShipping(event.target.value)
              }
              className="h-11 w-full rounded-lg border px-3"
            />
          </div>

          <div className="border-t pt-5">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">
                Subtotal
              </span>

              <span>
                ৳{subtotal.toFixed(2)}
              </span>
            </div>

            <div className="mt-3 flex justify-between text-sm">
              <span className="text-neutral-500">
                Discount
              </span>

              <span>
                - ৳{discountValue.toFixed(2)}
              </span>
            </div>

            <div className="mt-3 flex justify-between text-sm">
              <span className="text-neutral-500">
                Shipping
              </span>

              <span>
                ৳{shippingValue.toFixed(2)}
              </span>
            </div>

            <div className="mt-5 flex justify-between border-t pt-5 text-lg font-bold">
              <span>Grand Total</span>

              <span>
                ৳{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Notes */}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <label className="mb-2 block text-sm font-medium">
          Notes
        </label>

        <textarea
          name="notes"
          rows={4}
          className="w-full rounded-lg border px-3 py-3"
          placeholder="Optional order notes"
        />
      </section>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-sky-600 px-6 py-3 font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Creating Order..."
            : "Create Order"}
        </button>
      </div>
    </form>
  );
}