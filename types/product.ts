export interface Product {
  id: string;

  category_id: string;

  name: string;

  slug: string;

  short_description: string | null;

  description: string | null;

  sku: string | null;

  color: string | null;

  size: string | null;

  purchase_cost: number;

  regular_price: number;

  sale_price: number | null;

  stock_quantity: number;

  low_stock_threshold: number;

  is_featured: boolean;

  is_active: boolean;

  seo_title: string | null;

  seo_description: string | null;

  brand_id: string | null;

  created_at: string;

  updated_at: string;
}