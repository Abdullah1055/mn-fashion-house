import { z } from "zod";

export const orderSchema = z.object({
  customer_name: z
    .string()
    .trim()
    .min(2, "Customer name is required")
    .max(150),

  customer_phone: z
    .string()
    .trim()
    .min(5, "Customer phone is required")
    .max(30),

  customer_email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),

  shipping_address: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("")),

  discount_amount: z.coerce
    .number()
    .min(0)
    .default(0),

  shipping_amount: z.coerce
    .number()
    .min(0)
    .default(0),

  payment_method: z.enum([
    "cash_on_delivery",
    "online",
    "bank_transfer",
  ]),

  notes: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .or(z.literal("")),
});

export type OrderSchema = z.infer<
  typeof orderSchema
>;