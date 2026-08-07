import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name is required")
    .max(100),

  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(120),

  description: z
    .string()
    .trim()
    .optional(),

  is_active: z.boolean(),
});

export type CategorySchema = z.infer<typeof categorySchema>;