import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type OrderConfirmationPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function OrderConfirmationPage({
  params,
}: OrderConfirmationPageProps) {
  const { orderId } = await params;

  const supabase = await createClient();

  const { data: order, error } =
    await supabase
      .from("orders")
      .select(
        `
          id,
          order_number,
          customer_name,
          customer_phone,
          customer_email,
          shipping_address,
          subtotal,
          discount_amount,
          shipping_amount,
          total_amount,
          payment_method,
          payment_status,
          order_status,
          notes,
          created_at
        `
      )
      .eq("id", orderId)
      .maybeSingle();

  if (error || !order) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h1 className="text-2xl font-bold">
            Order Not Found
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            We could not find the order you are looking for.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  const { data: items } =
    await supabase
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
          subtotal,
          line_total
        `
      )
      .eq("order_id", order.id)
      .order("created_at", {
        ascending: true,
      });

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="text-center">
            <CheckCircle2
              className="mx-auto h-16 w-16 text-green-600"
              strokeWidth={1.8}
            />

            <h1 className="mt-5 text-3xl font-bold tracking-tight">
              Order Placed Successfully!
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Thank you for shopping with MN Fashion House.
            </p>

            <div className="mt-5 inline-flex rounded-full bg-neutral-100 px-4 py-2 text-sm font-semibold">
              Order #{order.order_number}
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border p-5">
              <h2 className="font-semibold">
                Customer Information
              </h2>

              <div className="mt-4 space-y-2 text-sm">
                <p>
                  <span className="text-neutral-500">
                    Name:
                  </span>{" "}
                  {order.customer_name}
                </p>

                <p>
                  <span className="text-neutral-500">
                    Phone:
                  </span>{" "}
                  {order.customer_phone}
                </p>

                {order.customer_email && (
                  <p>
                    <span className="text-neutral-500">
                      Email:
                    </span>{" "}
                    {order.customer_email}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border p-5">
              <h2 className="font-semibold">
                Delivery Information
              </h2>

              <div className="mt-4 text-sm">
                <p className="text-neutral-500">
                  Delivery Address
                </p>

                <p className="mt-1 leading-6">
                  {order.shipping_address ||
                    "No delivery address provided."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-xl border">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold">
                Order Items
              </h2>
            </div>

            <div className="divide-y">
              {items?.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">
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
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="font-semibold">
                      ৳
                      {Number(
                        item.subtotal ??
                          item.line_total ??
                          0
                      ).toLocaleString()}
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      ৳
                      {Number(
                        item.unit_price
                      ).toLocaleString()}{" "}
                      × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 ml-auto max-w-sm">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">
                  Subtotal
                </span>

                <span>
                  ৳
                  {Number(
                    order.subtotal
                  ).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-500">
                  Delivery
                </span>

                <span>
                  {Number(
                    order.shipping_amount
                  ) === 0
                    ? "Free"
                    : `৳${Number(
                        order.shipping_amount
                      ).toLocaleString()}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-500">
                  Discount
                </span>

                <span>
                  -৳
                  {Number(
                    order.discount_amount
                  ).toLocaleString()}
                </span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>

                  <span>
                    ৳
                    {Number(
                      order.total_amount
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-neutral-50 p-5">
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <div>
                <span className="text-neutral-500">
                  Payment:
                </span>{" "}
                <span className="font-medium">
                  {order.payment_method ===
                  "cash_on_delivery"
                    ? "Cash on Delivery"
                    : order.payment_method}
                </span>
              </div>

              <div>
                <span className="text-neutral-500">
                  Payment Status:
                </span>{" "}
                <span className="font-medium capitalize">
                  {order.payment_status}
                </span>
              </div>

              <div>
                <span className="text-neutral-500">
                  Order Status:
                </span>{" "}
                <span className="font-medium capitalize">
                  {order.order_status}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Continue Shopping
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border px-6 py-3 text-sm font-semibold transition hover:bg-neutral-50"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}