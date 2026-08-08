export type PaymentMethod =
  | "cash_on_delivery"
  | "online"
  | "bank_transfer";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;

  order_number: string;

  customer_name: string;

  customer_phone: string;

  customer_email: string | null;

  shipping_address: string | null;

  subtotal: number;

  discount_amount: number;

  shipping_amount: number;

  total_amount: number;

  payment_method: PaymentMethod;

  payment_status: PaymentStatus;

  order_status: OrderStatus;

  notes: string | null;

  created_at: string;

  updated_at: string;
}