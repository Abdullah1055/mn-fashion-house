"use server";

import { createClient } from "@/lib/supabase/server";

import type { PaymentStatus } from "@/types/order";

type UpdatePaymentResult = {
  success: boolean;
  error?: string;
};

const allowedStatuses: PaymentStatus[] = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

export async function updatePaymentStatus(
  orderId: string,
  newStatus: PaymentStatus
): Promise<UpdatePaymentResult> {
  const supabase = await createClient();

  if (!orderId) {
    return {
      success: false,
      error: "Order ID is required.",
    };
  }

  if (!allowedStatuses.includes(newStatus)) {
    return {
      success: false,
      error: "Invalid payment status.",
    };
  }

  const { data: order, error: fetchError } =
    await supabase
      .from("orders")
      .select(
        "id, order_status, payment_status"
      )
      .eq("id", orderId)
      .maybeSingle();

  if (fetchError) {
    return {
      success: false,
      error: fetchError.message,
    };
  }

  if (!order) {
    return {
      success: false,
      error: "Order not found.",
    };
  }

  if (order.order_status === "cancelled") {
    return {
      success: false,
      error:
        "Payment status cannot be changed for a cancelled order.",
    };
  }

  if (order.payment_status === newStatus) {
    return {
      success: true,
    };
  }

  const { error: updateError } =
    await supabase
      .from("orders")
      .update({
        payment_status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

  if (updateError) {
    return {
      success: false,
      error: updateError.message,
    };
  }

  return {
    success: true,
  };
}