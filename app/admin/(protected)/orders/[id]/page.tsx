import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { OrderStatusControl } from "@/components/orders/order-status-control";
import { PaymentStatusControl } from "@/components/orders/payment-status-control";
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
    <div className="space-y-4">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

        <div>
          <Link
            href="/admin/orders"
            className="mb-2 inline-flex items-center gap-1.5 text-sm text-neutral-500 transition hover:text-neutral-900"
          >
            <ArrowLeft size={15} />
            Back to Orders
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-neutral-950">
            Order #{order.order_number}
          </h1>

          <p className="mt-1 text-xs text-neutral-500">
            Created {formatDate(order.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-2">

          <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium capitalize text-neutral-700">
            {order.order_status}
          </span>

          <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium capitalize text-neutral-700">
            {order.payment_status.replace(
              "_",
              " "
            )}
          </span>

        </div>
      </div>

      {/* =====================================================
          CUSTOMER + DELIVERY
      ====================================================== */}

      <div className="grid gap-3 lg:grid-cols-2">

        {/* Customer */}

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">

          <h2 className="text-base font-semibold text-neutral-950">
            Customer Information
          </h2>

          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">

            <div>
              <p className="text-xs text-neutral-500">
                Name
              </p>

              <p className="mt-0.5 font-medium text-neutral-900">
                {order.customer_name}
              </p>
            </div>

            <div>
              <p className="text-xs text-neutral-500">
                Phone
              </p>

              <p className="mt-0.5 font-medium text-neutral-900">
                {order.customer_phone}
              </p>
            </div>

            {order.customer_email && (
              <div className="sm:col-span-2">
                <p className="text-xs text-neutral-500">
                  Email
                </p>

                <p className="mt-0.5 font-medium text-neutral-900">
                  {order.customer_email}
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Delivery */}

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">

          <h2 className="text-base font-semibold text-neutral-950">
            Delivery Information
          </h2>

          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">

            <div>
              <p className="text-xs text-neutral-500">
                Address
              </p>

              <p className="mt-0.5 leading-5 text-neutral-700">
                {order.delivery_address || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-neutral-500">
                District
              </p>

              <p className="mt-0.5 font-medium text-neutral-900">
                {order.district || "-"}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* =====================================================
          ORDER ITEMS
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">

        <div className="border-b border-neutral-200 px-4 py-3">
          <h2 className="text-base font-semibold text-neutral-950">
            Order Items
          </h2>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-neutral-50">
              <tr>

                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Product
                </th>

                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  SKU
                </th>

                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Quantity
                </th>

                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Unit Price
                </th>

                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Subtotal
                </th>

              </tr>
            </thead>

            <tbody>

              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-neutral-100 transition hover:bg-neutral-50"
                >

                  <td className="px-4 py-2.5 text-sm font-medium text-neutral-900">
                    {item.product_name}
                  </td>

                  <td className="px-4 py-2.5 text-sm text-neutral-600">
                    {item.sku || "-"}
                  </td>

                  <td className="px-4 py-2.5 text-right text-sm text-neutral-700">
                    {item.quantity}
                  </td>

                  <td className="px-4 py-2.5 text-right text-sm text-neutral-700">
                    {formatCurrency(
                      Number(item.unit_price)
                    )}
                  </td>

                  <td className="px-4 py-2.5 text-right text-sm font-semibold text-neutral-900">
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
                    className="px-4 py-6 text-center text-sm text-neutral-500"
                  >
                    No items found for this order.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          FINANCIAL SUMMARY
      ====================================================== */}

      <div className="grid gap-3 lg:grid-cols-2">

        {/* Order Summary */}

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">

          <h2 className="text-base font-semibold text-neutral-950">
            Order Summary
          </h2>

          <div className="mt-3 space-y-2.5 text-sm">

            <div className="flex items-center justify-between">
              <span className="text-neutral-500">
                Subtotal
              </span>

              <span className="font-medium text-neutral-900">
                {formatCurrency(
                  Number(order.subtotal)
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-500">
                Discount
              </span>

              <span className="font-medium text-neutral-900">
                -{" "}
                {formatCurrency(
                  Number(
                    order.discount_amount || 0
                  )
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-500">
                Delivery Charge
              </span>

              <span className="font-medium text-neutral-900">
                {formatCurrency(
                  Number(
                    order.delivery_charge || 0
                  )
                )}
              </span>
            </div>

            <div className="mt-2 border-t border-neutral-200 pt-3">

              <div className="flex items-center justify-between">

                <span className="font-semibold text-neutral-950">
                  Grand Total
                </span>

                <span className="text-lg font-bold text-neutral-950">
                  {formatCurrency(orderTotal)}
                </span>

              </div>
            </div>

          </div>
        </div>

        {/* Profit */}

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">

          <h2 className="text-base font-semibold text-neutral-950">
            Profit Overview
          </h2>

          <div className="mt-3 space-y-2.5">

            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">
                Order Revenue
              </span>

              <span className="font-medium text-neutral-900">
                {formatCurrency(orderTotal)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">
                Product Cost
              </span>

              <span className="font-medium text-neutral-900">
                {formatCurrency(totalCost)}
              </span>
            </div>

            <div className="mt-2 border-t border-neutral-200 pt-3">

              <div className="flex items-center justify-between">

                <span className="font-semibold text-neutral-950">
                  Estimated Profit
                </span>

                <span
                  className={`text-lg font-bold ${
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

      {/* =====================================================
          PAYMENT + NOTES
      ====================================================== */}

      <div className="grid gap-3 lg:grid-cols-2">

        {/* Payment */}

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">

          <h2 className="text-base font-semibold text-neutral-950">
            Payment
          </h2>

          <div className="mt-3 space-y-2.5 text-sm">

            <div className="flex items-center justify-between">
              <span className="text-neutral-500">
                Method
              </span>

              <span className="font-medium capitalize text-neutral-900">
                {order.payment_method.replace(
                  "_",
                  " "
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-500">
                Status
              </span>

              <PaymentStatusControl
                orderId={order.id}
                currentStatus={order.payment_status}
              />
            </div>

          </div>
        </div>

        {/* Notes */}

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">

          <div className="flex items-center justify-between gap-4">

            <h2 className="text-base font-semibold text-neutral-950">
              Notes
            </h2>

            <OrderStatusControl
              orderId={order.id}
              currentStatus={order.order_status}
            />

          </div>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-5 text-neutral-600">
            {order.notes || "No notes added."}
          </p>

        </div>
      </div>

    </div>
  );
}