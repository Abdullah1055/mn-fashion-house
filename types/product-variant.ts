export type ProductVariant = {
  id: string;
  product_id: string;
  sku: string | null;
  size: string | null;
  color: string | null;
  purchase_cost: number | null;
  regular_price: number | null;
  sale_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};