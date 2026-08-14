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

  color: string | null;
  size: string | null;

  regular_price: number;
  sale_price: number | null;

  stock_quantity: number;
};

type Props = {
  products: ProductOption[];
};

type OrderSource =
  | "online"
  | "store";

export function OrderForm({
  products,
}: Props) {
  const router = useRouter();

  const [orderSource, setOrderSource] =
    useState<OrderSource>("online");

  const [items, setItems] = useState<
    CreateOrderItemInput[]
  >([]);

  const [discount, setDiscount] =
    useState("0");

  const [shipping, setShipping] =
    useState("0");

  const [paymentMethod, setPaymentMethod] =
    useState("cash_on_delivery");

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
          product.id ===
          item.product_id
      );

      if (!product) {
        return total;
      }

      const price = Number(
        product.sale_price ??
          product.regular_price
      );

      return (
        total +
        price * item.quantity
      );
    },
    0
  );

  const discountValue =
    Number(discount) || 0;

  const shippingValue =
    orderSource === "store"
      ? 0
      : Number(shipping) || 0;

  const grandTotal =
    subtotal -
    discountValue +
    shippingValue;

  function handleOrderSourceChange(
    source: OrderSource
  ) {
    setOrderSource(source);

    if (source === "store") {
      setShipping("0");
      setPaymentMethod(
        "cash_on_delivery"
      );
    }
  }

  function handleItemsChange(
    newItems: {
      product_id: string;
      quantity: number;
    }[]
  ) {
    setSelectedItems(newItems);

    setItems(
      newItems.map((item) => ({
        product_id:
          item.product_id,
        quantity:
          item.quantity,
      }))
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    if (
      selectedItems.length === 0
    ) {
      setError(
        "Please add at least one product."
      );
      return;
    }

    if (
      discountValue > subtotal
    ) {
      setError(
        "Discount cannot be greater than subtotal."
      );
      return;
    }

    try {
      setLoading(true);

      const formData =
        new FormData(
          event.currentTarget
        );

      formData.set(
        "order_source",
        orderSource
      );

      formData.set(
        "payment_method",
        paymentMethod
      );

      if (orderSource === "store") {
        formData.set(
          "customer_name",
          "Walk-in Customer"
        );

        formData.set(
          "shipping_amount",
          "0"
        );
      }

      const result =
        await createOrder(
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
      {/* =====================================================
          ORDER TYPE
      ====================================================== */}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold">
            Order Type
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Select how this order was created.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {/* Online */}

          <label
            className={`cursor-pointer rounded-xl border p-4 transition ${
              orderSource === "online"
                ? "border-sky-500 bg-sky-50"
                : "border-neutral-200 hover:bg-neutral-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="order_source_display"
                value="online"
                checked={
                  orderSource ===
                  "online"
                }
                onChange={() =>
                  handleOrderSourceChange(
                    "online"
                  )
                }
                className="mt-1 h-4 w-4"
              />

              <div>
                <p className="font-semibold text-neutral-900">
                  Online Order
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  Order placed for online delivery.
                </p>
              </div>
            </div>
          </label>

          {/* Store */}

          <label
            className={`cursor-pointer rounded-xl border p-4 transition ${
              orderSource === "store"
                ? "border-sky-500 bg-sky-50"
                : "border-neutral-200 hover:bg-neutral-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="order_source_display"
                value="store"
                checked={
                  orderSource ===
                  "store"
                }
                onChange={() =>
                  handleOrderSourceChange(
                    "store"
                  )
                }
                className="mt-1 h-4 w-4"
              />

              <div>
                <p className="font-semibold text-neutral-900">
                  Store Sale
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  Sale made directly at the showroom.
                </p>
              </div>
            </div>
          </label>
        </div>
      </section>

      {/* =====================================================
          CUSTOMER
      ====================================================== */}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Customer Information
        </h2>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {/* Customer Name */}

          <div>
            <label
              htmlFor="customer_name"
              className="mb-2 block text-sm font-medium"
            >
              Customer Name
            </label>

            <input
              id="customer_name"
              name="customer_name"
              required
              defaultValue={
                orderSource ===
                "store"
                  ? "Walk-in Customer"
                  : ""
              }
              key={orderSource}
              className="h-11 w-full rounded-lg border px-3"
              placeholder="Customer name"
            />
          </div>

          {/* Phone */}

          <div>
            <label
              htmlFor="customer_phone"
              className="mb-2 block text-sm font-medium"
            >
              Phone
            </label>

            <input
              id="customer_phone"
              name="customer_phone"
              required={
                orderSource ===
                "online"
              }
              className="h-11 w-full rounded-lg border px-3"
              placeholder="01XXXXXXXXX"
            />
          </div>

          {/* Email */}

          {orderSource ===
            "online" && (
            <div>
              <label
                htmlFor="customer_email"
                className="mb-2 block text-sm font-medium"
              >
                Email
              </label>

              <input
                id="customer_email"
                name="customer_email"
                type="email"
                className="h-11 w-full rounded-lg border px-3"
                placeholder="customer@example.com"
              />
            </div>
          )}

          {/* Payment */}

          <div>
            <label
              htmlFor="payment_method"
              className="mb-2 block text-sm font-medium"
            >
              Payment Method
            </label>

            <select
              id="payment_method"
              name="payment_method"
              value={
                paymentMethod
              }
              onChange={(event) =>
                setPaymentMethod(
                  event.target.value
                )
              }
              className="h-11 w-full rounded-lg border px-3"
            >
              <option value="cash_on_delivery">
                Cash
              </option>

              <option value="online">
                Online
              </option>

              <option value="bank_transfer">
                Bank Transfer
              </option>
            </select>
          </div>

          {/* Shipping Address */}

          {orderSource ===
            "online" && (
            <div className="md:col-span-2">
              <label
                htmlFor="shipping_address"
                className="mb-2 block text-sm font-medium"
              >
                Shipping Address
              </label>

              <textarea
                id="shipping_address"
                name="shipping_address"
                rows={3}
                required
                className="w-full rounded-lg border px-3 py-3"
                placeholder="Full delivery address"
              />
            </div>
          )}

          {/* Hidden Store Customer Fields */}

          {orderSource ===
            "store" && (
            <input
              type="hidden"
              name="customer_email"
              value=""
            />
          )}
        </div>
      </section>

      {/* =====================================================
          PRODUCTS
      ====================================================== */}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          {orderSource ===
          "store"
            ? "Store Sale Products"
            : "Order Products"}
        </h2>

        <div className="mt-6">
          <OrderProductSelector
            products={products}
            value={
              selectedItems
            }
            onChange={
              handleItemsChange
            }
          />
        </div>
      </section>

      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Sale Summary
        </h2>

        <div className="mt-6 ml-auto max-w-md space-y-5">
          {/* Discount */}

          <div>
            <label
              htmlFor="discount_amount"
              className="mb-2 block text-sm font-medium"
            >
              Discount
            </label>

            <input
              id="discount_amount"
              name="discount_amount"
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(event) =>
                setDiscount(
                  event.target.value
                )
              }
              className="h-11 w-full rounded-lg border px-3"
            />
          </div>

          {/* Shipping */}

          {orderSource ===
            "online" && (
            <div>
              <label
                htmlFor="shipping_amount"
                className="mb-2 block text-sm font-medium"
              >
                Delivery Charge
              </label>

              <input
                id="shipping_amount"
                name="shipping_amount"
                type="number"
                min="0"
                step="0.01"
                value={shipping}
                onChange={(event) =>
                  setShipping(
                    event.target.value
                  )
                }
                className="h-11 w-full rounded-lg border px-3"
              />
            </div>
          )}

          {orderSource ===
            "store" && (
            <input
              type="hidden"
              name="shipping_amount"
              value="0"
            />
          )}

          {/* Totals */}

          <div className="border-t pt-5">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">
                Subtotal
              </span>

              <span>
                ৳
                {subtotal.toFixed(
                  2
                )}
              </span>
            </div>

            <div className="mt-3 flex justify-between text-sm">
              <span className="text-neutral-500">
                Discount
              </span>

              <span>
                - ৳
                {discountValue.toFixed(
                  2
                )}
              </span>
            </div>

            {orderSource ===
              "online" && (
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-neutral-500">
                  Delivery
                </span>

                <span>
                  ৳
                  {shippingValue.toFixed(
                    2
                  )}
                </span>
              </div>
            )}

            <div className="mt-5 flex justify-between border-t pt-5 text-lg font-bold">
              <span>
                Grand Total
              </span>

              <span>
                ৳
                {grandTotal.toFixed(
                  2
                )}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          NOTES
      ====================================================== */}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <label
          htmlFor="notes"
          className="mb-2 block text-sm font-medium"
        >
          Notes
        </label>

        <textarea
          id="notes"
          name="notes"
          rows={4}
          className="w-full rounded-lg border px-3 py-3"
          placeholder={
            orderSource ===
            "store"
              ? "Optional store sale notes"
              : "Optional order notes"
          }
        />
      </section>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          ACTION
      ====================================================== */}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-sky-600 px-6 py-3 font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : orderSource ===
              "store"
              ? "Complete Store Sale"
              : "Create Order"}
        </button>
      </div>
    </form>
  );
}