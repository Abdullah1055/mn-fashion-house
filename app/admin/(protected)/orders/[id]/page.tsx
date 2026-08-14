import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { OrderStatusControl } from "@/components/orders/order-status-control";
import { getOrderWithItems } from "@/lib/services/order.service";

function formatCurrency(value: number) {
  return `৳${value.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const result = await getOrderWithItems(id);

  if (!result) {
    notFound();
  }

  const { order, items } = result;

  const totalCost = items.reduce(
    (sum, item) =>
      sum +
      Number(item.purchase_cost) *
        Number(item.quantity),
    0
  );

  const orderTotal =
    Number(order.subtotal || 0) +
    Number(order.delivery_charge || 0) -
    Number(order.discount_amount || 0);

  const estimatedProfit =
    orderTotal - totalCost;

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900"
          >
            <ArrowLeft size={16} />
            Back to Orders
          </Link>

          <h1 className="text-3xl font-bold">
            Order #{order.order_number}
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Created {formatDate(order.created_at)}
          </p>
        </div>

        <div className="flex gap-3">
          <span className="rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium capitalize">
            {order.order_status}
          </span>

          <span className="rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium capitalize">
            {order.payment_status.replace(
              "_",
              " "
            )}
          </span>
        </div>
      </div>

      {/* Customer + Delivery */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">
            Customer Information
          </h2>

          <div className="mt-5 space-y-3 text-sm">
            <div>
              <p className="text-neutral-500">
                Name
              </p>

              <p className="font-medium">
                {order.customer_name}
              </p>
            </div>

            <div>
              <p className="text-neutral-500">
                Phone
              </p>

              <p className="font-medium">
                {order.customer_phone}
              </p>
            </div>

            {order.customer_email && (
              <div>
                <p className="text-neutral-500">
                  Email
                </p>

                <p className="font-medium">
                  {order.customer_email}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Delivery */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">
            Delivery Information
          </h2>

          <div className="mt-5 space-y-3 text-sm">
            <div>
              <p className="text-neutral-500">
                Address
              </p>

              <p className="leading-6 text-neutral-700">
                {order.delivery_address || "-"}
              </p>
            </div>

            <div>
              <p className="text-neutral-500">
                District
              </p>

              <p className="font-medium">
                {order.district || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-6 py-5">
          <h2 className="text-lg font-semibold">
            Order Items
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-6 py-4 text-left">
                  Product
                </th>

                <th className="px-6 py-4 text-left">
                  SKU
                </th>

                <th className="px-6 py-4 text-right">
                  Quantity
                </th>

                <th className="px-6 py-4 text-right">
                  Unit Price
                </th>

                <th className="px-6 py-4 text-right">
                  Subtotal
                </th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-t"
                >
                  <td className="px-6 py-4 font-medium">
                    {item.product_name}
                  </td>

                  <td className="px-6 py-4">
                    {item.sku || "-"}
                  </td>

                  <td className="px-6 py-4 text-right">
                    {item.quantity}
                  </td>

                  <td className="px-6 py-4 text-right">
                    {formatCurrency(
                      Number(item.unit_price)
                    )}
                  </td>

                  <td className="px-6 py-4 text-right font-medium">
                    {formatCurrency(
                      Number(item.line_total)
                    )}
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-neutral-500"
                  >
                    No items found for this order.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Summary */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Summary */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">
            Order Summary
          </h2>

          <div className="mt-5 space-y-4 text-sm">
            {/* Subtotal */}

            <div className="flex justify-between">
              <span className="text-neutral-500">
                Subtotal
              </span>

              <span className="font-medium">
                {formatCurrency(
                  Number(order.subtotal)
                )}
              </span>
            </div>

            {/* Discount */}

            <div className="flex justify-between">
              <span className="text-neutral-500">
                Discount
              </span>

              <span className="font-medium">
                -{" "}
                {formatCurrency(
                  Number(
                    order.discount_amount || 0
                  )
                )}
              </span>
            </div>

            {/* Delivery */}

            <div className="flex justify-between">
              <span className="text-neutral-500">
                Delivery Charge
              </span>

              <span className="font-medium">
                {formatCurrency(
                  Number(
                    order.delivery_charge || 0
                  )
                )}
              </span>
            </div>

            {/* Grand Total */}

            <div className="border-t pt-4">
              <div className="flex justify-between text-base">
                <span className="font-semibold">
                  Grand Total
                </span>

                <span className="font-bold">
                  {formatCurrency(orderTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profit */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">
            Profit Overview
          </h2>

          <div className="mt-5 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">
                Order Revenue
              </span>

              <span className="font-medium">
                {formatCurrency(orderTotal)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">
                Product Cost
              </span>

              <span className="font-medium">
                {formatCurrency(totalCost)}
              </span>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span className="font-semibold">
                  Estimated Profit
                </span>

                <span
                  className={`font-bold ${
                    estimatedProfit >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(
                    estimatedProfit
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment + Notes */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">
            Payment
          </h2>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">
                Method
              </span>

              <span className="font-medium capitalize">
                {order.payment_method.replace(
                  "_",
                  " "
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-500">
                Status
              </span>

              <span className="font-medium capitalize">
                {order.payment_status}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">
              Notes
            </h2>

            <OrderStatusControl
              orderId={order.id}
              currentStatus={order.order_status}
            />
          </div>

          <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
            {order.notes || "No notes added."}
          </p>
        </div>
      </div>
    </div>
  );
}