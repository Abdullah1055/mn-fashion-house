import { z } from "zod";

export const productSchema = z.object({
  category_id: z.string().uuid(),

  brand_id: z
    .string()
    .uuid()
    .nullable()
    .optional(),

  name: z
    .string()
    .trim()
    .min(2)
    .max(150),

  slug: z
    .string()
    .trim()
    .min(2)
    .max(180),

  short_description: z
    .string()
    .optional(),

  description: z
    .string()
    .optional(),

  sku: z
    .string()
    .optional(),

  purchase_cost: z.coerce.number(),

  regular_price: z.coerce.number(),

  sale_price: z.coerce
    .number()
    .nullable()
    .optional(),

  stock_quantity: z.coerce.number(),

  low_stock_threshold: z.coerce.number(),

  is_featured: z.boolean(),

  is_active: z.boolean(),

  seo_title: z
    .string()
    .optional(),

  seo_description: z
    .string()
    .optional(),
});

export type ProductSchema =
  z.infer<typeof productSchema>;