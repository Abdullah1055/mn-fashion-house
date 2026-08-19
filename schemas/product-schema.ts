import { z } from "zod";

export const productSchema = z.object({
  category_id: z
    .string()
    .min(1, "Category is required."),

  brand_id: z
    .string()
    .nullable(),

  name: z
    .string()
    .trim()
    .min(
      1,
      "Product name is required."
    ),

  slug: z
    .string()
    .trim()
    .min(
      1,
      "Product slug is required."
    ),

  short_description:
    z.string().nullable(),

  description:
    z.string().nullable(),

  sku:
    z.string().nullable(),

  color:
    z.string().nullable(),

  /*
   * Size is now handled inside
   * product_variants.
   */
  size:
    z.string().nullable(),

  purchase_cost:
    z.coerce
      .number()
      .min(
        0,
        "Purchase cost cannot be negative."
      ),

  regular_price:
    z.coerce
      .number()
      .min(
        0,
        "Regular price cannot be negative."
      ),

  sale_price:
    z
      .number()
      .min(
        0,
        "Sale price cannot be negative."
      )
      .nullable(),

  /*
   * Automatically calculated:
   *
   * S + M + L + XL
   */
  stock_quantity:
    z.coerce
      .number()
      .int()
      .min(0),

  low_stock_threshold:
    z.coerce
      .number()
      .int()
      .min(0)
      .default(3),

  is_featured:
    z.boolean(),

  is_active:
    z.boolean(),

  seo_title:
    z.string().nullable(),

  seo_description:
    z.string().nullable(),
});