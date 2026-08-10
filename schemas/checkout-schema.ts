import { orderSchema } from "@/schemas/order-schema";

export const checkoutSchema =
  orderSchema;

export type CheckoutSchema =
  typeof checkoutSchema;