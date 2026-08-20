import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type OrderConfirmationPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

function formatCurrency(value: number) {
  return `৳${Number(value || 0).toLocaleString(
    "en-BD",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}

function formatPaymentMethod(
  paymentMethod: string
) {
  switch (paymentMethod) {
    case "cash_on_delivery":
      return "Cash on Delivery";

    case "online":
      return "Online Payment";

    case "bank_transfer":
      return "Bank Transfer";

    default:
      return paymentMethod;
  }
}

export default async function OrderConfirmationPage({
  params,
}: OrderConfirmationPageProps) {
  const { orderId } = await params;

  const supabase = await createClient();

  /* =========================================================
     ORDER
  ========================================================= */

  const {
    data: order,
    error: orderError,
  } = await supabase
    .from("orders")
    .select(
      `
        id,
        order_number,
        customer_name,
        customer_phone,
        customer_email,
        delivery_address,
        subtotal,
        discount_amount,
        delivery_charge,
        payment_method,
        payment_status,
        order_status,
        order_source,
        notes,
        created_at
      `
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) {
    console.error(
      "Order confirmation fetch error:",
      orderError
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <div className="rounded-2xl border bg-white p-10 shadow-sm">
            <h1 className="text-2xl font-bold text-neutral-950">
              Order Not Found
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              We could not find the order you are
              looking for.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     ORDER ITEMS
  ========================================================= */

  const {
    data: items,
    error: itemsError,
  } = await supabase
    .from("order_items")
    .select(
      `
        id,
        product_name,
        sku,
        color,
        size,
        quantity,
        unit_price,
        line_total,
        purchase_cost
      `
    )
    .eq("order_id", order.id)
    .order("created_at", {
      ascending: true,
    });

  if (itemsError) {
    console.error(
      "Order items fetch error:",
      itemsError
    );
  }

  /* =========================================================
     TOTALS
  ========================================================= */

  const subtotal = Number(
    order.subtotal || 0
  );

  const discountAmount = Number(
    order.discount_amount || 0
  );

  const deliveryCharge = Number(
    order.delivery_charge || 0
  );

  const totalAmount =
    subtotal -
    discountAmount +
    deliveryCharge;

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">

          {/* ===================================================
              SUCCESS HEADER
          ==================================================== */}

          <div className="text-center">
            <CheckCircle2
              className="mx-auto h-16 w-16 text-green-600"
              strokeWidth={1.8}
            />

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-neutral-950">
              Order Placed Successfully!
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Thank you for shopping with MN Fashion
              House.
            </p>

            <div className="mt-5 inline-flex rounded-full bg-neutral-100 px-5 py-2 text-sm font-semibold text-neutral-800">
              Order #{order.order_number}
            </div>
          </div>

          {/* ===================================================
              CUSTOMER + DELIVERY
          ==================================================== */}

          <div className="mt-10 grid gap-6 md:grid-cols-2">

            {/* CUSTOMER */}

            <div className="rounded-xl border border-neutral-200 p-5">
              <h2 className="font-semibold text-neutral-950">
                Customer Information
              </h2>

              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <p className="text-neutral-500">
                    Name
                  </p>

                  <p className="mt-1 font-medium">
                    {order.customer_name}
                  </p>
                </div>

                <div>
                  <p className="text-neutral-500">
                    Phone
                  </p>

                  <p className="mt-1 font-medium">
                    {order.customer_phone}
                  </p>
                </div>

                {order.customer_email && (
                  <div>
                    <p className="text-neutral-500">
                      Email
                    </p>

                    <p className="mt-1 font-medium break-all">
                      {order.customer_email}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* DELIVERY */}

            <div className="rounded-xl border border-neutral-200 p-5">
              <h2 className="font-semibold text-neutral-950">
                Delivery Information
              </h2>

              <div className="mt-4">
                <p className="text-sm text-neutral-500">
                  Delivery Address
                </p>

                <p className="mt-1 text-sm leading-6 text-neutral-800">
                  {order.delivery_address ||
                    "No delivery address provided."}
                </p>
              </div>
            </div>
          </div>

          {/* ===================================================
              ORDER ITEMS
          ==================================================== */}

          <div className="mt-8 rounded-xl border border-neutral-200">

            <div className="border-b border-neutral-200 px-5 py-4">
              <h2 className="font-semibold text-neutral-950">
                Order Items
              </h2>

              <p className="mt-1 text-xs text-neutral-500">
                {items?.length || 0} item
                {items?.length === 1
                  ? ""
                  : "s"}
              </p>
            </div>

            <div className="divide-y divide-neutral-200">
              {items &&
              items.length > 0 ? (
                items.map((item) => {
                  const lineTotal =
                    Number(
                      item.line_total ??
                        Number(
                          item.unit_price
                        ) *
                          Number(
                            item.quantity
                          )
                    );

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      {/* ITEM INFO */}

                      <div className="min-w-0">
                        <p className="font-medium text-neutral-950">
                          {item.product_name}
                        </p>

                        {(item.color ||
                          item.size) && (
                          <p className="mt-1 text-sm text-neutral-500">
                            {item.color &&
                              `Color: ${item.color}`}

                            {item.color &&
                              item.size &&
                              " · "}

                            {item.size &&
                              `Size: ${item.size}`}
                          </p>
                        )}

                        {item.sku && (
                          <p className="mt-1 text-xs text-neutral-400">
                            SKU: {item.sku}
                          </p>
                        )}

                        <p className="mt-1 text-sm text-neutral-500">
                          Qty:{" "}
                          {item.quantity}
                        </p>
                      </div>

                      {/* PRICE */}

                      <div className="text-left sm:text-right">
                        <p className="font-semibold text-neutral-950">
                          {formatCurrency(
                            lineTotal
                          )}
                        </p>

                        <p className="mt-1 text-xs text-neutral-500">
                          {formatCurrency(
                            Number(
                              item.unit_price
                            )
                          )}{" "}
                          ×{" "}
                          {item.quantity}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-5 py-8 text-center text-sm text-neutral-500">
                  No order items found.
                </div>
              )}
            </div>
          </div>

          {/* ===================================================
              ORDER SUMMARY
          ==================================================== */}

          <div className="mt-8 ml-auto max-w-md rounded-xl border border-neutral-200 p-5">
            <h2 className="font-semibold text-neutral-950">
              Order Summary
            </h2>

            <div className="mt-5 space-y-3 text-sm">

              {/* SUBTOTAL */}

              <div className="flex justify-between">
                <span className="text-neutral-500">
                  Subtotal
                </span>

                <span className="font-medium">
                  {formatCurrency(
                    subtotal
                  )}
                </span>
              </div>

              {/* DELIVERY */}

              <div className="flex justify-between">
                <span className="text-neutral-500">
                  Delivery
                </span>

                <span className="font-medium">
                  {deliveryCharge ===
                  0
                    ? "Free"
                    : formatCurrency(
                        deliveryCharge
                      )}
                </span>
              </div>

              {/* DISCOUNT */}

              <div className="flex justify-between">
                <span className="text-neutral-500">
                  Discount
                </span>

                <span className="font-medium">
                  {discountAmount >
                  0
                    ? `-${formatCurrency(
                        discountAmount
                      )}`
                    : "৳0.00"}
                </span>
              </div>

              {/* TOTAL */}

              <div className="border-t border-neutral-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-neutral-950">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-neutral-950">
                    {formatCurrency(
                      totalAmount
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================
              PAYMENT / STATUS
          ==================================================== */}

          <div className="mt-8 rounded-xl bg-neutral-50 p-5">
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">

              {/* PAYMENT */}

              <div>
                <span className="text-neutral-500">
                  Payment:
                </span>{" "}
                <span className="font-medium">
                  {formatPaymentMethod(
                    order.payment_method
                  )}
                </span>
              </div>

              {/* PAYMENT STATUS */}

              <div>
                <span className="text-neutral-500">
                  Payment Status:
                </span>{" "}
                <span className="font-medium capitalize">
                  {String(
                    order.payment_status
                  ).replace(
                    /_/g,
                    " "
                  )}
                </span>
              </div>

              {/* ORDER STATUS */}

              <div>
                <span className="text-neutral-500">
                  Order Status:
                </span>{" "}
                <span className="font-medium capitalize">
                  {String(
                    order.order_status
                  ).replace(
                    /_/g,
                    " "
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* ===================================================
              NOTES
          ==================================================== */}

          {order.notes && (
            <div className="mt-6 rounded-xl border border-neutral-200 p-5">
              <h2 className="font-semibold text-neutral-950">
                Order Notes
              </h2>

              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-neutral-600">
                {order.notes}
              </p>
            </div>
          )}

          {/* ===================================================
              ACTIONS
          ==================================================== */}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Continue Shopping
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}