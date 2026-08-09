"use client";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { useState } from "react";

export function OrderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [status, setStatus] = useState(
    searchParams.get("status") || ""
  );

  const [payment, setPayment] = useState(
    searchParams.get("payment") || ""
  );

  function applyFilters() {
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set(
        "search",
        search.trim()
      );
    }

    if (status) {
      params.set("status", status);
    }

    if (payment) {
      params.set("payment", payment);
    }

    params.set("page", "1");

    const query = params.toString();

    router.push(
      query
        ? `/admin/orders?${query}`
        : "/admin/orders"
    );
  }

  function clearFilters() {
    setSearch("");
    setStatus("");
    setPayment("");

    router.push("/admin/orders");
  }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-[1fr_180px_180px_auto_auto]">
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              applyFilters();
            }
          }}
          placeholder="Search order, customer or phone..."
          className="h-11 rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
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
          value={payment}
          onChange={(event) =>
            setPayment(event.target.value)
          }
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
          type="button"
          onClick={applyFilters}
          className="h-11 rounded-lg bg-sky-600 px-5 font-medium text-white transition hover:bg-sky-700"
        >
          Filter
        </button>

        <button
          type="button"
          onClick={clearFilters}
          className="h-11 rounded-lg border border-neutral-300 px-5 font-medium transition hover:bg-neutral-50"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
