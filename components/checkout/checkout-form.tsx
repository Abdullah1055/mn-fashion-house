"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { createOrder } from "@/lib/actions/order";
import { useCart } from "@/components/cart/cart-provider";

export function CheckoutForm() {
  const router = useRouter();

  const {
    items,
    subtotal,
    clearCart,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const [error, setError] =
    useState<string | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  const shippingAmount = 0;
  const discountAmount = 0;

  const totalAmount =
    subtotal -
    discountAmount +
    shippingAmount;

  /* =========================================================
     PLACE ORDER
  ========================================================= */

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
        new FormData(
          event.currentTarget
        );

      formData.set(
        "discount_amount",
        String(discountAmount)
      );

      formData.set(
        "shipping_amount",
        String(shippingAmount)
      );

      /*
       * IMPORTANT:
       *
       * Every size is already stored
       * as a separate cart item.
       *
       * Example:
       *
       * S × 2
       * M × 1
       * L × 3
       *
       * Each one goes to createOrder
       * independently.
       */

      const orderItems =
        items.map((item) => ({
          product_id:
            item.productId,

          variant_id:
            item.variantId,

          quantity:
            item.quantity,
        }));

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

      /*
       * Clear cart only after
       * successful order creation.
       */

      clearCart();

      router.push(
        `/order-confirmation/${result.orderId}`
      );
    } catch (submitError) {
      console.error(
        "Checkout error:",
        submitError
      );

      setError(
        "Something went wrong while placing your order."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* =========================================================
     EMPTY CART
  ========================================================= */

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-12 w-12 text-neutral-400" />

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

  /* =========================================================
     CHECKOUT
  ========================================================= */

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-8 lg:grid-cols-[1fr_400px]"
    >
      {/* =====================================================
          LEFT
      ====================================================== */}

      <div className="space-y-6">

        {/* ===================================================
            CUSTOMER INFORMATION
        ==================================================== */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">
            Customer Information
          </h2>

          <div className="mt-6 grid gap-5">

            {/* FULL NAME */}

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

            {/* PHONE */}

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

            {/* EMAIL */}

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

            {/* ADDRESS */}

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

        {/* ===================================================
            PAYMENT METHOD
        ==================================================== */}

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

        {/* ===================================================
            ORDER NOTES
        ==================================================== */}

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

        {/* ===================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

      </div>

      {/* =====================================================
          RIGHT — ORDER SUMMARY
      ====================================================== */}

      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">

          <h2 className="text-lg font-semibold">
            Order Summary
          </h2>

          {/* =================================================
              CART ITEMS
          ================================================== */}

          <div className="mt-6 space-y-4">

            {items.map((item) => {
              const itemKey = `${item.productId}:${item.variantId ?? "default"}`;

              const lineTotal =
                item.price *
                item.quantity;

              return (
                <div
                  key={itemKey}
                  className="rounded-xl border border-neutral-200 p-3"
                >

                  {/* =========================================
                      PRODUCT HEADER
                  ========================================== */}

                  <div className="flex gap-3">

                    {/* IMAGE */}

                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">

                      {item.imageUrl ? (
                        <img
                          src={
                            item.imageUrl
                          }
                          alt={
                            item.productName
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                          No image
                        </div>
                      )}

                    </div>

                    {/* PRODUCT INFO */}

                    <div className="min-w-0 flex-1">

                      <p className="line-clamp-2 text-sm font-semibold text-neutral-900">
                        {
                          item.productName
                        }
                      </p>

                      {item.color && (
                        <p className="mt-1 text-xs text-neutral-500">
                          Color:{" "}
                          <span className="font-medium text-neutral-700">
                            {
                              item.color
                            }
                          </span>
                        </p>
                      )}

                      {item.size && (
                        <p className="mt-0.5 text-xs text-neutral-500">
                          Size:{" "}
                          <span className="font-semibold text-neutral-800">
                            {
                              item.size
                            }
                          </span>
                        </p>
                      )}

                      <p className="mt-1 text-xs text-neutral-500">
                        ৳
                        {Number(
                          item.price
                        ).toLocaleString()}{" "}
                        ×{" "}
                        {
                          item.quantity
                        }
                      </p>

                    </div>

                    {/* REMOVE */}

                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart(
                          itemKey
                        )
                      }
                      disabled={
                        submitting
                      }
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed"
                      aria-label="Remove item"
                    >
                      <X
                        size={15}
                      />
                    </button>

                  </div>

                  {/* =========================================
                      QUANTITY + TOTAL
                  ========================================== */}

                  <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">

                    {/* QUANTITY */}

                    <div className="flex items-center overflow-hidden rounded-lg border border-neutral-200">

                      <button
                        type="button"
                        disabled={
                          submitting ||
                          item.quantity <=
                            1
                        }
                        onClick={() =>
                          updateQuantity(
                            itemKey,
                            item.quantity -
                              1
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-300"
                        aria-label="Decrease quantity"
                      >
                        <Minus
                          size={14}
                        />
                      </button>

                      <span className="flex h-8 min-w-9 items-center justify-center border-x border-neutral-200 px-2 text-xs font-semibold">
                        {
                          item.quantity
                        }
                      </span>

                      <button
                        type="button"
                        disabled={
                          submitting
                        }
                        onClick={() =>
                          updateQuantity(
                            itemKey,
                            item.quantity +
                              1
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-300"
                        aria-label="Increase quantity"
                      >
                        <Plus
                          size={14}
                        />
                      </button>

                    </div>

                    {/* LINE TOTAL */}

                    <p className="text-sm font-bold text-neutral-950">
                      ৳
                      {lineTotal.toLocaleString()}
                    </p>

                  </div>

                </div>
              );
            })}

          </div>

          {/* =================================================
              TOTALS
          ================================================== */}

          <div className="my-6 border-t" />

          <div className="space-y-3 text-sm">

            {/* SUBTOTAL */}

            <div className="flex justify-between">
              <span className="text-neutral-500">
                Subtotal
              </span>

              <span className="font-medium">
                ৳
                {subtotal.toLocaleString()}
              </span>
            </div>

            {/* DELIVERY */}

            <div className="flex justify-between">
              <span className="text-neutral-500">
                Delivery
              </span>

              <span className="font-medium">
                {shippingAmount ===
                0
                  ? "Free"
                  : `৳${shippingAmount.toLocaleString()}`}
              </span>
            </div>

            {/* DISCOUNT */}

            <div className="flex justify-between">
              <span className="text-neutral-500">
                Discount
              </span>

              <span className="font-medium">
                {discountAmount ===
                0
                  ? "৳0"
                  : `-৳${discountAmount.toLocaleString()}`}
              </span>
            </div>

          </div>

          <div className="my-6 border-t" />

          {/* GRAND TOTAL */}

          <div className="flex items-center justify-between">

            <span className="text-base font-semibold">
              Total
            </span>

            <span className="text-2xl font-bold">
              ৳
              {totalAmount.toLocaleString()}
            </span>

          </div>

          {/* =================================================
              PLACE ORDER
          ================================================== */}

          <button
            type="submit"
            disabled={
              submitting ||
              items.length === 0
            }
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

          {/* BACK TO CART */}

          <Link
            href="/cart"
            className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-black"
          >
            <ArrowLeft
              size={16}
            />

            Back to Cart
          </Link>

        </div>
      </div>
    </form>
  );
}