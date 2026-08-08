import { createClient } from "@/lib/supabase/server";

import type { Order } from "@/types/order";
import type { OrderItem } from "@/types/order-item";

export async function getOrders(): Promise<Order[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as Order[];
}

export async function getOrderById(
  id: string
): Promise<Order | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Order | null;
}

export async function getOrderItems(
  orderId: string
): Promise<OrderItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as OrderItem[];
}

export async function getOrderWithItems(
  id: string
) {
  const [order, items] = await Promise.all([
    getOrderById(id),
    getOrderItems(id),
  ]);

  if (!order) {
    return null;
  }

  return {
    order,
    items,
  };
}