export interface ProductImage {
  id: string;

  product_id: string;

  image_url: string;

  alt_text: string | null;

  is_primary: boolean;

  sort_order: number;

  created_at: string;
}