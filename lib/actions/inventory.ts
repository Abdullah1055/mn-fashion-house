"use server";

import { createClient } from "@/lib/supabase/server";

type InventoryMovementType =
  | "in"
  | "out"
  | "adjustment";

type AdjustStockResult = {
  success: boolean;
  error?: string;
};

export async function adjustProductStock(
  productId: string,
  quantity: number,
  movementType: InventoryMovementType,
  reason?: string
): Promise<AdjustStockResult> {
  const supabase = await createClient();

  if (!productId) {
    return {
      success: false,
      error: "Product ID is required.",
    };
  }

  if (!Number.isInteger(quantity)) {
    return {
      success: false,
      error: "Quantity must be a whole number.",
    };
  }

  if (quantity === 0) {
    return {
      success: false,
      error: "Quantity cannot be zero.",
    };
  }

  if (
    !["in", "out", "adjustment"].includes(
      movementType
    )
  ) {
    return {
      success: false,
      error: "Invalid movement type.",
    };
  }

  const quantityChange =
    movementType === "out"
      ? -Math.abs(quantity)
      : movementType === "in"
        ? Math.abs(quantity)
        : quantity;

  const { error } = await supabase.rpc(
    "adjust_product_stock",
    {
      p_product_id: productId,
      p_quantity_change: quantityChange,
      p_movement_type: movementType,
      p_reason: reason?.trim() || null,
    }
  );

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
}