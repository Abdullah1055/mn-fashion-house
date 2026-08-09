import type { ProductVariant } from "@/types/product-variant";

export type CartItem = {
  productId: string;
  productName: string;
  productSlug: string;
  variantId: string | null;
  variant: ProductVariant | null;
  imageUrl: string | null;
  size: string | null;
  color: string | null;
  price: number;
  quantity: number;
};

export type CartState = {
  items: CartItem[];
};