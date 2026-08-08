import { createClient } from "@/lib/supabase/server";

export type InventoryLog = {
  id: string;
  product_id: string;
  quantity_change: number;
  stock_before: number;
  stock_after: number;
  movement_type:
    | "in"
    | "out"
    | "adjustment";
  reason: string | null;
  created_by: string | null;
  created_at: string;
};

export async function getInventoryLogs(
  productId: string
): Promise<InventoryLog[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("inventory_logs")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data as InventoryLog[];
}