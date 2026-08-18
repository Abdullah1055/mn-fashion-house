export type PromotionalBanner = {
  id: string;

  title: string;

  description: string | null;

  discount_text: string | null;

  image_url: string | null;

  storage_path: string | null;

  button_text: string;

  button_link: string | null;

  start_at: string | null;

  end_at: string | null;

  is_active: boolean;

  is_dismissible: boolean;

  display_order: number;

  created_at: string;

  updated_at: string;
};