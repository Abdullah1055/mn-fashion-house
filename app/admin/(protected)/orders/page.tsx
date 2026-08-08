import Link from "next/link";
import {
  ArrowRight,
  ShoppingCart,
} from "lucide-react";

import { getOrders } from "@/lib/services/order.service";
import { PaymentStatusControl } from "@/components/orders/payment-status-control";

function formatCurrency(value: number) {
  return `৳${value.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(
    "en-BD",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

function getPaymentBadge(status: string) {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-700";

    case "failed":
      return "bg-red-100 text-red-700";

    case "refunded":
      return "bg-purple-100 text-purple-700";

    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

function getOrderBadge(status: string) {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-700";

    case "cancelled":
      return "bg-red-100 text-red-700";

    case "shipped":
      return "bg-blue-100 text-blue-700";

    case "processing":
      return "bg-indigo-100 text-indigo-700";

    case "confirmed":
      return "bg-cyan-100 text-cyan-700";

    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

export default async function OrdersPage() {
  const orders = await getOrders();

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) =>
      order.order_status === "pending"
  ).length;

  const completedOrders = orders.filter(
    (order) =>
      order.order_status === "delivered"
  ).length;

  const totalSales = orders
    .filter(
      (order) =>
        order.order_status !== "cancelled"
    )
    .reduce(
      (total, order) =>
        total + Number(order.total_amount),
      0
    );

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Orders
          </h1>

          <p className="mt-2 text-neutral-500">
            Manage customer orders and sales.
          </p>
        </div>

        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 rounded-lg border px-5 py-3 text-sm font-medium transition hover:bg-neutral-50"
        >
          <ShoppingCart size={17} />

          Products
        </Link>
      </div>

      {/* Summary Cards */}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">
            Total Orders
          </p>

          <p className="mt-2 text-3xl font-bold">
            {totalOrders}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">
            Pending Orders
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {pendingOrders}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">
            Completed Orders
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {completedOrders}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">
            Total Sales
          </p>

          <p className="mt-2 text-3xl font-bold">
            {formatCurrency(totalSales)}
          </p>
        </div>
      </div>

      {/* Orders Table */}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-6 py-5">
          <h2 className="text-lg font-semibold">
            Recent Orders
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-6 py-4 text-left">
                  Order
                </th>

                <th className="px-6 py-4 text-left">
                  Customer
                </th>

                <th className="px-6 py-4 text-left">
                  Date
                </th>

                <th className="px-6 py-4 text-right">
                  Total
                </th>

                <th className="px-6 py-4 text-center">
                  Payment
                </th>

                <th className="px-6 py-4 text-center">
                  Status
                </th>

                <th className="px-6 py-4 text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-t transition hover:bg-neutral-50"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold">
                      #{order.order_number}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-medium">
                      {order.customer_name}
                    </div>

                    <div className="mt-1 text-xs text-neutral-500">
                      {order.customer_phone}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {formatDate(
                      order.created_at
                    )}
                  </td>

                  <td className="px-6 py-4 text-right font-semibold">
                    {formatCurrency(
                      Number(order.total_amount)
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getPaymentBadge(
                        order.payment_status
                      )}`}
                    >
                      {order.payment_status.replace(
                        "_",
                        " "
                      )}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getOrderBadge(
                        order.order_status
                      )}`}
                    >
                      {order.order_status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-neutral-50"
                    >
                      View

                      <ArrowRight size={15} />
                    </Link>
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-neutral-500"
                  >
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}