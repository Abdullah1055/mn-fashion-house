export interface OrderItem {
  id: string;

  order_id: string;

  product_id: string;

  variant_id: string | null;

  product_name: string;

  sku: string | null;

  color: string | null;

  size: string | null;

  quantity: number;

  unit_price: number;

  line_total: number;

  purchase_cost: number | null;

  created_at: string;
}