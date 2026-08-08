export interface OrderItem {
  id: string;

  order_id: string;

  product_id: string;

  product_name: string;

  sku: string | null;

  quantity: number;

  unit_price: number;

  purchase_cost: number;

  subtotal: number;

  created_at: string;
}