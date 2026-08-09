export type ProductImage = {
  id: string;

  product_id: string;

  image_url: string;

  storage_path: string;

  alt_text: string | null;

  is_primary: boolean;

  sort_order: number;

  created_at: string;

  updated_at: string;
};