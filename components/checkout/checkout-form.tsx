"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { createOrder } from "@/lib/actions/order";
import { useCart } from "@/components/cart/cart-provider";

export function CheckoutForm() {
  const router = useRouter();

  const {
    items,
    subtotal,
    clearCart,
  } = useCart();

  const [error, setError] =
    useState<string | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  const shippingAmount: number = 0;
  const discountAmount: number = 0;

  const totalAmount: number =
    subtotal -
    discountAmount +
    shippingAmount;

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    if (items.length === 0) {
      setError(
        "Your cart is empty."
      );
      return;
    }

    setSubmitting(true);

    try {
      const formData =
        new FormData(event.currentTarget);

      formData.set(
        "discount_amount",
        String(discountAmount)
      );

      formData.set(
        "shipping_amount",
        String(shippingAmount)
      );

      const orderItems = items.map(
        (item) => ({
          product_id:
            item.productId,

          variant_id:
            item.variantId,

          quantity:
            item.quantity,
        })
      );

      const result =
        await createOrder(
          formData,
          orderItems
        );

      if (!result.success) {
        setError(
          result.error ||
            "Unable to place your order."
        );
        return;
      }

      if (!result.orderId) {
        setError(
          "Order was created but no order ID was returned."
        );
        return;
      }

      clearCart();

      router.push(
        `/order-confirmation/${result.orderId}`
      );
    } catch {
      setError(
        "Something went wrong while placing your order."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
        <CheckCircle2
          className="mx-auto h-12 w-12 text-neutral-400"
        />

        <h2 className="mt-4 text-xl font-semibold">
          Your cart is empty
        </h2>

        <p className="mt-2 text-sm text-neutral-500">
          Add some products before
          proceeding to checkout.
        </p>

        <Link
          href="/products"
          className="mt-6 inline-flex items-center rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-8 lg:grid-cols-[1fr_400px]"
    >
      <div className="space-y-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">
            Customer Information
          </h2>

          <div className="mt-6 grid gap-5">
            <div>
              <label
                htmlFor="customer_name"
                className="text-sm font-medium"
              >
                Full Name
              </label>

              <input
                id="customer_name"
                name="customer_name"
                type="text"
                required
                placeholder="Enter your full name"
                className="mt-2 h-11 w-full rounded-lg border px-3 text-sm outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="customer_phone"
                className="text-sm font-medium"
              >
                Phone Number
              </label>

              <input
                id="customer_phone"
                name="customer_phone"
                type="tel"
                required
                placeholder="01XXXXXXXXX"
                className="mt-2 h-11 w-full rounded-lg border px-3 text-sm outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="customer_email"
                className="text-sm font-medium"
              >
                Email Address
                <span className="ml-1 text-neutral-400">
                  (Optional)
                </span>
              </label>

              <input
                id="customer_email"
                name="customer_email"
                type="email"
                placeholder="you@example.com"
                className="mt-2 h-11 w-full rounded-lg border px-3 text-sm outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="shipping_address"
                className="text-sm font-medium"
              >
                Delivery Address
              </label>

              <textarea
                id="shipping_address"
                name="shipping_address"
                required
                rows={4}
                placeholder="House, Road, Area, City..."
                className="mt-2 w-full rounded-lg border px-3 py-3 text-sm outline-none transition focus:border-black"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">
            Payment Method
          </h2>

          <div className="mt-5">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
              <input
                type="radio"
                name="payment_method"
                value="cash_on_delivery"
                defaultChecked
                className="mt-1"
              />

              <span>
                <span className="block text-sm font-medium">
                  Cash on Delivery
                </span>

                <span className="mt-1 block text-xs text-neutral-500">
                  Pay when your order is delivered.
                </span>
              </span>
            </label>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">
            Order Notes
          </h2>

          <textarea
            name="notes"
            rows={4}
            placeholder="Any special instructions? (Optional)"
            className="mt-5 w-full rounded-lg border px-3 py-3 text-sm outline-none transition focus:border-black"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">
            Order Summary
          </h2>

          <div className="mt-6 space-y-5">
            {items.map((item) => (
              <div
                key={`${item.productId}:${item.variantId ?? "default"}`}
                className="flex gap-3"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium">
                    {item.productName}
                  </p>

                  {(item.size ||
                    item.color) && (
                    <p className="mt-1 text-xs text-neutral-500">
                      {item.color &&
                        `Color: ${item.color}`}
                      {item.color &&
                        item.size &&
                        " · "}
                      {item.size &&
                        `Size: ${item.size}`}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-neutral-500">
                    Qty: {item.quantity}
                  </p>
                </div>

                <p className="text-sm font-medium">
                  ৳
                  {(
                    item.price *
                    item.quantity
                  ).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="my-6 border-t" />

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">
                Subtotal
              </span>

              <span className="font-medium">
                ৳
                {subtotal.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-500">
                Delivery
              </span>

              <span className="font-medium">
                {shippingAmount === 0
                  ? "Free"
                  : `৳${shippingAmount.toLocaleString()}`}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-500">
                Discount
              </span>

              <span className="font-medium">
                {discountAmount === 0
                  ? "৳0"
                  : `-৳${discountAmount.toLocaleString()}`}
              </span>
            </div>
          </div>

          <div className="my-6 border-t" />

          <div className="flex items-center justify-between">
            <span className="text-base font-semibold">
              Total
            </span>

            <span className="text-2xl font-bold">
              ৳
              {totalAmount.toLocaleString()}
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-black px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && (
              <Loader2
                size={18}
                className="animate-spin"
              />
            )}

            {submitting
              ? "Placing Order..."
              : "Place Order"}
          </button>

          <Link
            href="/cart"
            className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-black"
          >
            <ArrowLeft size={16} />
            Back to Cart
          </Link>
        </div>
      </div>
    </form>
  );
}