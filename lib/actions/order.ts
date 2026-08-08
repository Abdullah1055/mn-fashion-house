"use server";

import { createClient } from "@/lib/supabase/server";

import { orderSchema } from "@/schemas/order-schema";

export type CreateOrderItemInput = {
  product_id: string;
  quantity: number;
};

type CreateOrderResult = {
  success: boolean;
  orderId?: string;
  error?: string;
};

function generateOrderNumber() {
  const timestamp = Date.now()
    .toString()
    .slice(-8);

  const random = Math.floor(
    100 + Math.random() * 900
  );

  return `MN-${timestamp}${random}`;
}

export async function createOrder(
  formData: FormData,
  items: CreateOrderItemInput[]
): Promise<CreateOrderResult> {
  const supabase = await createClient();

  if (items.length === 0) {
    return {
      success: false,
      error: "Please add at least one product.",
    };
  }

  const parsed = orderSchema.safeParse({
    customer_name:
      formData.get("customer_name"),

    customer_phone:
      formData.get("customer_phone"),

    customer_email:
      formData.get("customer_email"),

    shipping_address:
      formData.get("shipping_address"),

    discount_amount:
      formData.get("discount_amount") || 0,

    shipping_amount:
      formData.get("shipping_amount") || 0,

    payment_method:
      formData.get("payment_method"),

    notes:
      formData.get("notes"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error:
        "Please check the customer and order information.",
    };
  }

  const discountAmount = Number(
    parsed.data.discount_amount || 0
  );

  const shippingAmount = Number(
    parsed.data.shipping_amount || 0
  );

  /*
   * Fetch selected products
   */

  const productIds = [
    ...new Set(
      items.map(
        (item) => item.product_id
      )
    ),
  ];

  const { data: products, error } =
    await supabase
      .from("products")
      .select(
        `
          id,
          name,
          sku,
          regular_price,
          sale_price,
          stock_quantity
        `
      )
      .in("id", productIds);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  if (
    !products ||
    products.length !== productIds.length
  ) {
    return {
      success: false,
      error:
        "One or more selected products were not found.",
    };
  }

  /*
   * Validate quantity and calculate subtotal
   */

  let subtotal = 0;

  for (const item of items) {
    const product = products.find(
      (product) =>
        product.id === item.product_id
    );

    if (!product) {
      return {
        success: false,
        error: "Product not found.",
      };
    }

    if (
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      return {
        success: false,
        error:
          `Invalid quantity for ${product.name}.`,
      };
    }

    if (
      Number(product.stock_quantity) <
      item.quantity
    ) {
      return {
        success: false,
        error:
          `Insufficient stock for ${product.name}.`,
      };
    }

    const unitPrice = Number(
      product.sale_price ??
        product.regular_price
    );

    subtotal +=
      unitPrice * item.quantity;
  }

  if (discountAmount < 0) {
    return {
      success: false,
      error:
        "Discount cannot be negative.",
    };
  }

  if (shippingAmount < 0) {
    return {
      success: false,
      error:
        "Shipping cannot be negative.",
    };
  }

  if (discountAmount > subtotal) {
    return {
      success: false,
      error:
        "Discount cannot be greater than subtotal.",
    };
  }

  const totalAmount =
    subtotal -
    discountAmount +
    shippingAmount;

  /*
   * Atomic database transaction
   */

  const { data: orderId, error: rpcError } =
    await supabase.rpc(
      "create_order_with_stock",
      {
        p_order_number:
          generateOrderNumber(),

        p_customer_name:
          parsed.data.customer_name,

        p_customer_phone:
          parsed.data.customer_phone,

        p_customer_email:
          parsed.data.customer_email || "",

        p_shipping_address:
          parsed.data.shipping_address || "",

        p_subtotal: subtotal,

        p_discount_amount:
          discountAmount,

        p_shipping_amount:
          shippingAmount,

        p_total_amount:
          totalAmount,

        p_payment_method:
          parsed.data.payment_method,

        p_notes:
          parsed.data.notes || "",

        p_items: items,
      }
    );

  if (rpcError) {
    return {
      success: false,
      error: rpcError.message,
    };
  }

  if (!orderId) {
    return {
      success: false,
      error:
        "Order was not created.",
    };
  }

  return {
    success: true,
    orderId,
  };
}