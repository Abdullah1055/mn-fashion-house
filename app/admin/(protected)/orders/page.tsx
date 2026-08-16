import Link from "next/link";
import {
  ArrowRight,
  Plus,
  ShoppingCart,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import type {
  OrderSource,
  OrderStatus,
  PaymentStatus,
} from "@/types/order";

const PAGE_SIZE = 10;

type SearchParams = {
  search?: string;
  status?: string;
  payment?: string;
  source?: string;
  from?: string;
  to?: string;
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

function getSourceBadge(
  source: OrderSource
) {
  if (source === "store") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-sky-100 text-sky-700";
}

function getOrderTotal(order: {
  subtotal: number;
  discount_amount: number;
  delivery_charge: number;
}) {
  return (
    Number(order.subtotal || 0) -
    Number(order.discount_amount || 0) +
    Number(order.delivery_charge || 0)
  );
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

  if (params.source) {
    query.set("source", params.source);
  }

  if (params.from) {
    query.set("from", params.from);
  }

  if (params.to) {
    query.set("to", params.to);
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

  const source =
    params.source || "";

  const fromDate =
    params.from || "";

  const toDate =
    params.to || "";

  const requestedPage = Number(
    params.page || "1"
  );

  const currentPage =
    Number.isInteger(requestedPage) &&
    requestedPage > 0
      ? requestedPage
      : 1;

  /*
   * =====================================================
   * MAIN ORDERS QUERY
   * =====================================================
   */

  let query = supabase
    .from("orders")
    .select(
      `
        id,
        order_number,
        customer_name,
        customer_phone,
        subtotal,
        discount_amount,
        delivery_charge,
        payment_status,
        order_status,
        order_source,
        created_at
      `,
      {
        count: "exact",
      }
    )
    .order("created_at", {
      ascending: false,
    });

  /*
   * =====================================================
   * SEARCH
   * =====================================================
   */

  if (search) {
    const escapedSearch =
      search.replace(
        /[%_]/g,
        "\\$&"
      );

    query = query.or(
      `order_number.ilike.%${escapedSearch}%,customer_name.ilike.%${escapedSearch}%,customer_phone.ilike.%${escapedSearch}%`
    );
  }

  /*
   * =====================================================
   * ORDER STATUS FILTER
   * =====================================================
   */

  if (status) {
    query = query.eq(
      "order_status",
      status
    );
  }

  /*
   * =====================================================
   * PAYMENT STATUS FILTER
   * =====================================================
   */

  if (payment) {
    query = query.eq(
      "payment_status",
      payment
    );
  }

  /*
   * =====================================================
   * ORDER SOURCE FILTER
   * =====================================================
   */

  if (
    source === "online" ||
    source === "store"
  ) {
    query = query.eq(
      "order_source",
      source
    );
  }

  /*
   * =====================================================
   * DATE FILTER
   *
   * From Date = start of selected day
   * To Date   = end of selected day
   *
   * Bangladesh timezone (+06:00) is used so the
   * selected calendar dates behave correctly.
   * =====================================================
   */

  if (fromDate) {
    query = query.gte(
      "created_at",
      `${fromDate}T00:00:00+06:00`
    );
  }

  if (toDate) {
    query = query.lte(
      "created_at",
      `${toDate}T23:59:59.999+06:00`
    );
  }

  /*
   * =====================================================
   * PAGINATION
   * =====================================================
   */

  const from =
    (currentPage - 1) *
    PAGE_SIZE;

  const to =
    from + PAGE_SIZE - 1;

  const {
    data: orders,
    error,
    count,
  } = await query.range(
    from,
    to
  );

  if (error) {
    throw error;
  }

  const totalOrders =
    count ?? 0;

  const totalPages =
    Math.ceil(
      totalOrders / PAGE_SIZE
    );

  /*
   * =====================================================
   * SUMMARY
   * =====================================================
   */

  const filteredOrders =
    orders ?? [];

  const pendingOrders =
    filteredOrders.filter(
      (order) =>
        order.order_status ===
        "pending"
    ).length;

  const completedOrders =
    filteredOrders.filter(
      (order) =>
        order.order_status ===
        "delivered"
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
          getOrderTotal(order),
        0
      );

  /*
   * =====================================================
   * ACTIVE DATE FILTER CHECK
   * =====================================================
   */

  const hasDateFilter =
    Boolean(
      fromDate || toDate
    );

  return (
    <div className="space-y-5">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Orders
          </h1>

          <p className="mt-1 text-sm text-neutral-500">
            Manage customer orders and sales.
          </p>
        </div>

        <div className="flex gap-2">

          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium transition hover:bg-neutral-50"
          >
            <ShoppingCart size={16} />
            Products
          </Link>

          <Link
            href="/admin/orders/new"
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700"
          >
            <Plus size={16} />
            New Order
          </Link>

        </div>
      </div>

      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-neutral-500">
            Orders Found
          </p>

          <p className="mt-1 text-2xl font-bold">
            {totalOrders}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-neutral-500">
            Pending
          </p>

          <p className="mt-1 text-2xl font-bold text-yellow-600">
            {pendingOrders}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-neutral-500">
            Delivered
          </p>

          <p className="mt-1 text-2xl font-bold text-green-600">
            {completedOrders}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-neutral-500">
            Sales
          </p>

          <p className="mt-1 text-2xl font-bold">
            {formatCurrency(totalSales)}
          </p>
        </div>

      </div>

      {/* =====================================================
          FILTERS
      ====================================================== */}

      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">

        <form
          method="GET"
          className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_145px_145px_170px_160px_150px_auto_auto]"
        >

          {/* Search */}

          <input
            name="search"
            defaultValue={search}
            placeholder="Search order, customer or phone..."
            className="h-10 rounded-lg border border-neutral-300 px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />

          {/* From Date */}

          <div>
            <label
              htmlFor="orders-from-date"
              className="sr-only"
            >
              From Date
            </label>

            <input
              id="orders-from-date"
              name="from"
              type="date"
              defaultValue={fromDate}
              title="From Date"
              className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm text-neutral-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* To Date */}

          <div>
            <label
              htmlFor="orders-to-date"
              className="sr-only"
            >
              To Date
            </label>

            <input
              id="orders-to-date"
              name="to"
              type="date"
              defaultValue={toDate}
              title="To Date"
              className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm text-neutral-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Order Status */}

          <select
            name="status"
            defaultValue={status}
            className="h-10 rounded-lg border border-neutral-300 px-3 text-sm capitalize outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
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

          {/* Payment */}

          <select
            name="payment"
            defaultValue={payment}
            className="h-10 rounded-lg border border-neutral-300 px-3 text-sm capitalize outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
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

          {/* Source */}

          <select
            name="source"
            defaultValue={source}
            className="h-10 rounded-lg border border-neutral-300 px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            <option value="">
              All Sources
            </option>

            <option value="online">
              Online Order
            </option>

            <option value="store">
              Store Sale
            </option>
          </select>

          {/* Filter */}

          <button
            type="submit"
            className="h-10 rounded-lg bg-sky-600 px-4 text-sm font-medium text-white transition hover:bg-sky-700"
          >
            Filter
          </button>

          {/* Clear */}

          <Link
            href="/admin/orders"
            className="flex h-10 items-center justify-center rounded-lg border border-neutral-300 px-4 text-sm font-medium transition hover:bg-neutral-50"
          >
            Clear
          </Link>

        </form>

        {/* Date helper */}

        {hasDateFilter && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-500">

            <span>
              Date range:
            </span>

            {fromDate && (
              <span className="rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700">
                From: {fromDate}
              </span>
            )}

            {toDate && (
              <span className="rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700">
                To: {toDate}
              </span>
            )}

          </div>
        )}
      </div>

      {/* =====================================================
          ACTIVE FILTERS
      ====================================================== */}

      {(search ||
        status ||
        payment ||
        source ||
        fromDate ||
        toDate) && (
        <div className="flex flex-wrap items-center gap-2 text-xs">

          <span className="text-neutral-500">
            Active filters:
          </span>

          {search && (
            <span className="rounded-full bg-neutral-100 px-3 py-1">
              Search: {search}
            </span>
          )}

          {fromDate && (
            <span className="rounded-full bg-neutral-100 px-3 py-1">
              From: {fromDate}
            </span>
          )}

          {toDate && (
            <span className="rounded-full bg-neutral-100 px-3 py-1">
              To: {toDate}
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

          {source && (
            <span className="rounded-full bg-neutral-100 px-3 py-1">
              Source:{" "}
              {source === "store"
                ? "Store Sale"
                : "Online Order"}
            </span>
          )}

        </div>
      )}

      {/* =====================================================
          ORDERS TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">

        <div className="border-b border-neutral-200 px-4 py-3">
          <h2 className="text-base font-semibold">
            Order List
          </h2>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1000px]">

            <thead className="bg-neutral-50">

              <tr>

                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Order
                </th>

                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Customer
                </th>

                <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Source
                </th>

                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Date
                </th>

                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Total
                </th>

                <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Payment
                </th>

                <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Status
                </th>

                <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Action
                </th>

              </tr>
            </thead>

            <tbody>

              {filteredOrders.map(
                (order) => {

                  const orderSource =
                    (order.order_source ||
                      "online") as OrderSource;

                  return (
                    <tr
                      key={order.id}
                      className="border-t border-neutral-100 transition hover:bg-neutral-50"
                    >

                      {/* Order */}

                      <td className="px-4 py-2.5">
                        <div className="text-sm font-semibold text-neutral-900">
                          #
                          {
                            order.order_number
                          }
                        </div>
                      </td>

                      {/* Customer */}

                      <td className="px-4 py-2.5">

                        <div className="text-sm font-medium text-neutral-900">
                          {
                            order.customer_name
                          }
                        </div>

                        <div className="mt-0.5 text-[11px] text-neutral-500">
                          {
                            order.customer_phone
                          }
                        </div>

                      </td>

                      {/* Source */}

                      <td className="px-4 py-2.5 text-center">

                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${getSourceBadge(
                            orderSource
                          )}`}
                        >
                          {orderSource ===
                          "store"
                            ? "Store Sale"
                            : "Online"}
                        </span>

                      </td>

                      {/* Date */}

                      <td className="px-4 py-2.5 text-sm text-neutral-600">
                        {formatDate(
                          order.created_at
                        )}
                      </td>

                      {/* Total */}

                      <td className="px-4 py-2.5 text-right text-sm font-semibold text-neutral-900">
                        {formatCurrency(
                          getOrderTotal(
                            order
                          )
                        )}
                      </td>

                      {/* Payment */}

                      <td className="px-4 py-2.5 text-center">

                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${getPaymentBadge(
                            order.payment_status
                          )}`}
                        >
                          {order.payment_status.replace(
                            "_",
                            " "
                          )}
                        </span>

                      </td>

                      {/* Status */}

                      <td className="px-4 py-2.5 text-center">

                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${getOrderBadge(
                            order.order_status
                          )}`}
                        >
                          {
                            order.order_status
                          }
                        </span>

                      </td>

                      {/* Action */}

                      <td className="px-4 py-2.5 text-center">

                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs font-medium transition hover:bg-neutral-50"
                        >
                          View

                          <ArrowRight
                            size={13}
                          />
                        </Link>

                      </td>

                    </tr>
                  )
                }
              )}

              {filteredOrders.length ===
                0 && (
                <tr>

                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center"
                  >

                    <p className="text-sm font-medium text-neutral-700">
                      No orders found
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      Try changing your search,
                      date range or filters.
                    </p>

                  </td>

                </tr>
              )}

            </tbody>

          </table>

        </div>

        {/* =====================================================
            PAGINATION
        ====================================================== */}

        {totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t border-neutral-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-xs text-neutral-500">

              Showing{" "}

              <span className="font-medium text-neutral-900">
                {from + 1}
              </span>

              {" "}to{" "}

              <span className="font-medium text-neutral-900">
                {Math.min(
                  from + PAGE_SIZE,
                  totalOrders
                )}
              </span>

              {" "}of{" "}

              <span className="font-medium text-neutral-900">
                {totalOrders}
              </span>

              {" "}orders

            </p>

            <div className="flex items-center gap-2">

              {currentPage > 1 ? (
                <Link
                  href={buildPageUrl(
                    params,
                    currentPage - 1
                  )}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium transition hover:bg-neutral-50"
                >
                  Previous
                </Link>
              ) : (
                <span className="cursor-not-allowed rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-300">
                  Previous
                </span>
              )}

              <span className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium">
                {currentPage} /{" "}
                {totalPages}
              </span>

              {currentPage <
              totalPages ? (
                <Link
                  href={buildPageUrl(
                    params,
                    currentPage + 1
                  )}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium transition hover:bg-neutral-50"
                >
                  Next
                </Link>
              ) : (
                <span className="cursor-not-allowed rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-300">
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