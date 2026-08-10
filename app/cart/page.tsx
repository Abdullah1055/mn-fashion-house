"use client";

import Link from "next/link";
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";

export default function CartPage() {
  const {
    items,
    subtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
          <div className="rounded-2xl border bg-white px-6 py-20 text-center shadow-sm">
            <ShoppingBag
              className="mx-auto h-12 w-12 text-neutral-400"
              strokeWidth={1.5}
            />

            <h1 className="mt-5 text-2xl font-bold text-neutral-950">
              Your Cart is Empty
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Looks like you haven't added
              anything to your cart yet.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-500">
            MN Fashion House
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
            Shopping Cart
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Review your selected products before
            checkout.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="rounded-2xl border bg-white shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-4 sm:px-6">
              <div>
                <h2 className="font-semibold text-neutral-900">
                  Cart Items
                </h2>

                <p className="mt-1 text-xs text-neutral-500">
                  {items.reduce(
                    (total, item) =>
                      total + item.quantity,
                    0
                  )}{" "}
                  item
                  {items.reduce(
                    (total, item) =>
                      total + item.quantity,
                    0
                  ) === 1
                    ? ""
                    : "s"}
                </p>
              </div>

              <button
                type="button"
                onClick={clearCart}
                className="text-sm font-medium text-red-600 transition hover:text-red-700"
              >
                Clear Cart
              </button>
            </div>

            <div className="divide-y">
              {items.map((item) => {
                const itemKey = `${item.productId}:${
                  item.variantId ?? "default"
                }`;

                const itemTotal =
                  item.price *
                  item.quantity;

                return (
                  <div
                    key={itemKey}
                    className="p-5 sm:p-6"
                  >
                    <div className="flex gap-4">
                      <Link
                        href={`/products/${item.productSlug}`}
                        className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:h-28 sm:w-28"
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="h-full w-full object-cover transition hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                            No image
                          </div>
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link
                              href={`/products/${item.productSlug}`}
                              className="font-semibold text-neutral-950 transition hover:text-neutral-600"
                            >
                              {item.productName}
                            </Link>

                            {(item.color ||
                              item.size) && (
                              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500">
                                {item.color && (
                                  <span>
                                    Color:{" "}
                                    {item.color}
                                  </span>
                                )}

                                {item.size && (
                                  <span>
                                    Size:{" "}
                                    {item.size}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeFromCart(
                                itemKey
                              )
                            }
                            className="shrink-0 rounded-lg p-2 text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Remove item"
                          >
                            <Trash2
                              size={17}
                            />
                          </button>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="text-sm text-neutral-500">
                              Unit Price
                            </p>

                            <p className="mt-1 font-semibold text-neutral-950">
                              ৳
                              {item.price.toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </p>
                          </div>

                          <div className="flex items-center rounded-lg border">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  itemKey,
                                  item.quantity -
                                    1
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center text-neutral-600 transition hover:bg-neutral-50"
                              aria-label="Decrease quantity"
                            >
                              <Minus
                                size={15}
                              />
                            </button>

                            <span className="flex h-9 min-w-10 items-center justify-center border-x px-2 text-sm font-medium">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  itemKey,
                                  item.quantity +
                                    1
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center text-neutral-600 transition hover:bg-neutral-50"
                              aria-label="Increase quantity"
                            >
                              <Plus
                                size={15}
                              />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-neutral-500">
                              Total
                            </p>

                            <p className="mt-1 font-semibold text-neutral-950">
                              ৳
                              {itemTotal.toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-950">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">
                    Subtotal
                  </span>

                  <span className="font-medium text-neutral-950">
                    ৳
                    {subtotal.toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-neutral-500">
                    Delivery
                  </span>

                  <span className="font-medium">
                    Free
                  </span>
                </div>
              </div>

              <div className="my-6 border-t" />

              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  Total
                </span>

                <span className="text-2xl font-bold">
                  ৳
                  {subtotal.toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </span>
              </div>

              <Link
                href="/checkout"
                className="mt-6 flex h-12 items-center justify-center rounded-lg bg-black px-5 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/products"
                className="mt-4 flex items-center justify-center text-sm font-medium text-neutral-600 transition hover:text-black"
              >
                Continue Shopping
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}