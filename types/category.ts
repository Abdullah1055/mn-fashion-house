export interface Category {
  id: string;

  name: string;

  slug: string;

  description: string | null;

  image_url: string | null;

  is_active: boolean;

  sort_order: number;

  seo_title: string | null;

  seo_description: string | null;

  parent_id: string | null;

  created_at: string;

  updated_at: string;
}

export interface CategoryFormData {
  name: string;

  slug: string;

  description: string;

  image_url: string;

  is_active: boolean;

  parent_id: string | null;
}