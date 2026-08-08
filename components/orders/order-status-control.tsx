
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { updateOrderStatus } from "@/lib/actions/order-status";

import type { OrderStatus } from "@/types/order";

type Props = {
  orderId: string;
  currentStatus: OrderStatus;
};

const statuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export function OrderStatusControl({
  orderId,
  currentStatus,
}: Props) {
  const router = useRouter();

  const [status, setStatus] =
    useState<OrderStatus>(currentStatus);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleChange(
    newStatus: OrderStatus
  ) {
    if (newStatus === status) {
      return;
    }

    if (
      newStatus === "cancelled"
    ) {
      const confirmed =
        window.confirm(
          "Cancel this order and restore its stock?"
        );

      if (!confirmed) {
        return;
      }
    }

    setError(null);
    setLoading(true);

    try {
      const result =
        await updateOrderStatus(
          orderId,
          newStatus
        );

      if (!result.success) {
        setError(
          result.error ||
            "Unable to update order status."
        );
        return;
      }

      setStatus(newStatus);

      router.refresh();
    } catch {
      setError(
        "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  const isFinal =
    status === "delivered" ||
    status === "cancelled";

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">
        Order Status
      </h2>

      <div className="mt-5">
        <select
          value={status}
          disabled={loading || isFinal}
          onChange={(event) =>
            handleChange(
              event.target.value as OrderStatus
            )
          }
          className="h-11 w-full rounded-lg border px-3 capitalize outline-none focus:border-sky-500"
        >
          {statuses.map(
            (item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            )
          )}
        </select>
      </div>

      {loading && (
        <p className="mt-3 text-sm text-neutral-500">
          Updating order status...
        </p>
      )}

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {status === "cancelled" && (
        <p className="mt-3 text-sm text-neutral-500">
          Stock has been restored for this
          cancelled order.
        </p>
      )}
    </div>
  );
}