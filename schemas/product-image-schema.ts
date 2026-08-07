import { z } from "zod";

export const productImageSchema = z.object({
  product_id: z.string().uuid(),

  image_url: z.string().url(),

  alt_text: z.string().optional(),

  is_primary: z.boolean(),

  sort_order: z.coerce.number(),
});

export type ProductImageSchema =
  z.infer<typeof productImageSchema>;