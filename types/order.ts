export type PaymentMethod =
  | "cash_on_delivery"
  | "online"
  | "bank_transfer";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

export type OrderSource =
  | "online"
  | "store";

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

  delivery_address: string | null;

  district: string | null;

  notes: string | null;

  subtotal: number;

  delivery_charge: number;

  discount_amount: number;

  payment_method: PaymentMethod;

  payment_status: PaymentStatus;

  order_status: OrderStatus;

  order_source: OrderSource;

  created_at: string;

  updated_at: string;
}