"use client";

import { useTransition } from "react";

import { updateOrderPaymentStatus } from "@/app/admin/actions/order-payment";

type PaymentStatusControlProps = {
  orderId: string;
  currentStatus: string;
};

export function PaymentStatusControl({
  orderId,
  currentStatus,
}: PaymentStatusControlProps) {
  const [isPending, startTransition] =
    useTransition();

  const handleChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;

    if (
      value !== "pending" &&
      value !== "paid"
    ) {
      return;
    }

    startTransition(async () => {
      try {
        await updateOrderPaymentStatus(
          orderId,
          value
        );
      } catch (error) {
        console.error(
          "Payment status update failed:",
          error
        );
      }
    });
  };

  return (
    <select
      value={
        currentStatus === "paid"
          ? "paid"
          : "pending"
      }
      onChange={handleChange}
      disabled={isPending}
      className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium capitalize text-neutral-900 outline-none transition focus:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <option value="pending">
        Pending
      </option>

      <option value="paid">
        Paid
      </option>
    </select>
  );
}