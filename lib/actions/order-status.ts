"use server";

import { createClient } from "@/lib/supabase/server";

import type { OrderStatus } from "@/types/order";

type UpdateOrderStatusResult = {
  success: boolean;
  error?: string;
};

const allowedStatuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<UpdateOrderStatusResult> {
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
      error: "Invalid order status.",
    };
  }

  /*
   * Fetch current order
   */

  const { data: order, error: orderError } =
    await supabase
      .from("orders")
      .select(
        "id, order_number, order_status"
      )
      .eq("id", orderId)
      .maybeSingle();

  if (orderError) {
    return {
      success: false,
      error: orderError.message,
    };
  }

  if (!order) {
    return {
      success: false,
      error: "Order not found.",
    };
  }

  if (order.order_status === newStatus) {
    return {
      success: true,
    };
  }

  /*
   * Delivered orders are final.
   */

  if (
    order.order_status === "delivered"
  ) {
    return {
      success: false,
      error:
        "A delivered order cannot be changed.",
    };
  }

  /*
   * Cancelled orders are final.
   */

  if (
    order.order_status === "cancelled"
  ) {
    return {
      success: false,
      error:
        "A cancelled order cannot be changed.",
    };
  }

  /*
   * Cancellation requires stock restoration.
   */

  if (newStatus === "cancelled") {
    const { error: rpcError } =
      await supabase.rpc(
        "cancel_order_and_restore_stock",
        {
          p_order_id: orderId,
        }
      );

    if (rpcError) {
      return {
        success: false,
        error: rpcError.message,
      };
    }

    return {
      success: true,
    };
  }

  /*
   * Normal status update.
   */

  const { error: updateError } =
    await supabase
      .from("orders")
      .update({
        order_status: newStatus,
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