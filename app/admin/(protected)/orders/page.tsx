import Link from "next/link";
import {
  ArrowRight,
  Plus,
  ShoppingCart,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import type {
  OrderStatus,
  PaymentStatus,
} from "@/types/order";

const PAGE_SIZE = 10;

type SearchParams = {
  search?: string;
  status?: string;
  payment?: string;
  page?: string;
};

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

function getPaymentBadge(
  status: PaymentStatus
) {
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

function getOrderBadge(
  status: OrderStatus
) {
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

function buildPageUrl(
  params: SearchParams,
  page: number
) {
  const query = new URLSearchParams();

  if (params.search) {
    query.set("search", params.search);
  }

  if (params.status) {
    query.set("status", params.status);
  }

  if (params.payment) {
    query.set("payment", params.payment);
  }

  query.set("page", String(page));

  return `/admin/orders?${query.toString()}`;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const supabase = await createClient();

  const search =
    params.search?.trim() || "";

  const status =
    params.status || "";

  const payment =
    params.payment || "";

  const requestedPage = Number(
    params.page || "1"
  );

  const currentPage =
    Number.isInteger(requestedPage) &&
    requestedPage > 0
      ? requestedPage
      : 1;

  /*
   * Main Orders Query
   */

  let query = supabase
    .from("orders")
    .select("*", {
      count: "exact",
    })
    .order("created_at", {
      ascending: false,
    });

  /*
   * Search
   */

  if (search) {
    const escapedSearch = search.replace(
      /[%_]/g,
      "\\$&"
    );

    query = query.or(
      `order_number.ilike.%${escapedSearch}%,customer_name.ilike.%${escapedSearch}%,customer_phone.ilike.%${escapedSearch}%`
    );
  }

  /*
   * Order Status Filter
   */

  if (status) {
    query = query.eq(
      "order_status",
      status
    );
  }

  /*
   * Payment Status Filter
   */

  if (payment) {
    query = query.eq(
      "payment_status",
      payment
    );
  }

  /*
   * Pagination
   */

  const from =
    (currentPage - 1) * PAGE_SIZE;

  const to =
    from + PAGE_SIZE - 1;

  const {
    data: orders,
    error,
    count,
  } = await query.range(from, to);

  if (error) {
    throw error;
  }

  const totalOrders = count ?? 0;

  const totalPages =
    Math.ceil(
      totalOrders / PAGE_SIZE
    );

  /*
   * Summary statistics
   *
   * These are calculated from the
   * current filtered result set.
   */

  const filteredOrders = orders ?? [];

  const pendingOrders =
    filteredOrders.filter(
      (order) =>
        order.order_status === "pending"
    ).length;

  const completedOrders =
    filteredOrders.filter(
      (order) =>
        order.order_status === "delivered"
    ).length;

  const totalSales =
    filteredOrders
      .filter(
        (order) =>
          order.order_status !==
          "cancelled"
      )
      .reduce(
        (total, order) =>
          total +
          Number(order.total_amount),
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

        <div className="flex gap-3">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 rounded-lg border px-5 py-3 text-sm font-medium transition hover:bg-neutral-50"
          >
            <ShoppingCart size={17} />

            Products
          </Link>

          <Link
            href="/admin/orders/new"
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-700"
          >
            <Plus size={17} />

            New Order
          </Link>
        </div>
      </div>

      {/* Summary */}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">
            Orders Found
          </p>

          <p className="mt-2 text-3xl font-bold">
            {totalOrders}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">
            Pending
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {pendingOrders}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">
            Delivered
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {completedOrders}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">
            Sales
          </p>

          <p className="mt-2 text-3xl font-bold">
            {formatCurrency(totalSales)}
          </p>
        </div>
      </div>

      {/* Filters */}

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <form
          method="GET"
          className="grid gap-4 md:grid-cols-[1fr_180px_180px_auto_auto]"
        >
          <input
            name="search"
            defaultValue={search}
            placeholder="Search order, customer or phone..."
            className="h-11 rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />

          <select
            name="status"
            defaultValue={status}
            className="h-11 rounded-lg border border-neutral-300 px-3 capitalize outline-none focus:border-sky-500"
          >
            <option value="">
              All Order Status
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="confirmed">
              Confirmed
            </option>

            <option value="processing">
              Processing
            </option>

            <option value="shipped">
              Shipped
            </option>

            <option value="delivered">
              Delivered
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>

          <select
            name="payment"
            defaultValue={payment}
            className="h-11 rounded-lg border border-neutral-300 px-3 capitalize outline-none focus:border-sky-500"
          >
            <option value="">
              All Payments
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="paid">
              Paid
            </option>

            <option value="failed">
              Failed
            </option>

            <option value="refunded">
              Refunded
            </option>
          </select>

          <button
            type="submit"
            className="h-11 rounded-lg bg-sky-600 px-5 font-medium text-white transition hover:bg-sky-700"
          >
            Filter
          </button>

          <Link
            href="/admin/orders"
            className="flex h-11 items-center justify-center rounded-lg border border-neutral-300 px-5 font-medium transition hover:bg-neutral-50"
          >
            Clear
          </Link>
        </form>
      </div>

      {/* Active Filters */}

      {(search || status || payment) && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-neutral-500">
            Active filters:
          </span>

          {search && (
            <span className="rounded-full bg-neutral-100 px-3 py-1">
              Search: {search}
            </span>
          )}

          {status && (
            <span className="rounded-full bg-neutral-100 px-3 py-1 capitalize">
              Status: {status}
            </span>
          )}

          {payment && (
            <span className="rounded-full bg-neutral-100 px-3 py-1 capitalize">
              Payment: {payment}
            </span>
          )}
        </div>
      )}

      {/* Orders Table */}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-6 py-5">
          <h2 className="text-lg font-semibold">
            Order List
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
              {filteredOrders.map(
                (order) => (
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
                        Number(
                          order.total_amount
                        )
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

                        <ArrowRight
                          size={15}
                        />
                      </Link>
                    </td>
                  </tr>
                )
              )}

              {filteredOrders.length ===
                0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center"
                  >
                    <p className="font-medium text-neutral-700">
                      No orders found
                    </p>

                    <p className="mt-1 text-sm text-neutral-500">
                      Try changing your search
                      or filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}

        {totalPages > 1 && (
          <div className="flex flex-col gap-4 border-t px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-500">
              Showing{" "}
              <span className="font-medium text-neutral-900">
                {from + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-neutral-900">
                {Math.min(
                  from + PAGE_SIZE,
                  totalOrders
                )}
              </span>{" "}
              of{" "}
              <span className="font-medium text-neutral-900">
                {totalOrders}
              </span>{" "}
              orders
            </p>

            <div className="flex items-center gap-2">
              {currentPage > 1 ? (
                <Link
                  href={buildPageUrl(
                    params,
                    currentPage - 1
                  )}
                  className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-neutral-50"
                >
                  Previous
                </Link>
              ) : (
                <span className="cursor-not-allowed rounded-lg border px-4 py-2 text-sm text-neutral-300">
                  Previous
                </span>
              )}

              <span className="rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium">
                {currentPage} / {totalPages}
              </span>

              {currentPage <
              totalPages ? (
                <Link
                  href={buildPageUrl(
                    params,
                    currentPage + 1
                  )}
                  className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-neutral-50"
                >
                  Next
                </Link>
              ) : (
                <span className="cursor-not-allowed rounded-lg border px-4 py-2 text-sm text-neutral-300">
                  Next
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}