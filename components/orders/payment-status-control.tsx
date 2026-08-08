"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { updatePaymentStatus } from "@/lib/actions/payment";

import type { PaymentStatus } from "@/types/order";

type Props = {
  orderId: string;
  currentStatus: PaymentStatus;
  orderStatus: string;
};

const statuses: PaymentStatus[] = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

export function PaymentStatusControl({
  orderId,
  currentStatus,
  orderStatus,
}: Props) {
  const router = useRouter();

  const [status, setStatus] =
    useState<PaymentStatus>(currentStatus);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleChange(
    newStatus: PaymentStatus
  ) {
    if (newStatus === status) {
      return;
    }

    if (newStatus === "refunded") {
      const confirmed =
        window.confirm(
          "Mark this payment as refunded?"
        );

      if (!confirmed) {
        return;
      }
    }

    setError(null);
    setLoading(true);

    try {
      const result =
        await updatePaymentStatus(
          orderId,
          newStatus
        );

      if (!result.success) {
        setError(
          result.error ||
            "Unable to update payment status."
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

  const disabled =
    loading ||
    orderStatus === "cancelled";

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">
        Payment Status
      </h2>

      <div className="mt-5">
        <select
          value={status}
          disabled={disabled}
          onChange={(event) =>
            handleChange(
              event.target.value as PaymentStatus
            )
          }
          className="h-11 w-full rounded-lg border px-3 capitalize outline-none focus:border-sky-500"
        >
          {statuses.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <p className="mt-3 text-sm text-neutral-500">
          Updating payment status...
        </p>
      )}

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}