"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type CreateOrderItemInput = {
  product_id: string;
  quantity: number;
};

type CreateOrderResult =
  | {
      success: true;
      orderId: string;
    }
  | {
      success: false;
      error: string;
    };

function generateOrderNumber() {
  const timestamp = Date.now().toString();

  const random = Math.floor(
    1000 + Math.random() * 9000
  ).toString();

  return `ORD-${timestamp.slice(
    -8
  )}-${random}`;
}

export async function createOrder(
  formData: FormData,
  items: CreateOrderItemInput[]
): Promise<CreateOrderResult> {
  const supabase = await createClient();

  try {
    if (!items.length) {
      return {
        success: false,
        error:
          "Please add at least one product.",
      };
    }

    /*
     * -------------------------------------------------------
     * ORDER SOURCE
     * -------------------------------------------------------
     */

    const orderSource =
      String(
        formData.get("order_source") ||
          "online"
      ) === "store"
        ? "store"
        : "online";

    /*
     * -------------------------------------------------------
     * CUSTOMER
     * -------------------------------------------------------
     */

    const customerNameInput =
      String(
        formData.get(
          "customer_name"
        ) || ""
      ).trim();

    const customerName =
      customerNameInput ||
      (orderSource === "store"
        ? "Walk-in Customer"
        : "");

    const customerPhone =
      String(
        formData.get(
          "customer_phone"
        ) || ""
      ).trim();

    const customerEmail =
      String(
        formData.get(
          "customer_email"
        ) || ""
      ).trim() || null;

    const deliveryAddress =
      String(
        formData.get(
          "shipping_address"
        ) || ""
      ).trim() || null;

    const notes =
      String(
        formData.get("notes") || ""
      ).trim() || null;

    /*
     * -------------------------------------------------------
     * PAYMENT
     * -------------------------------------------------------
     */

    const paymentMethod =
      String(
        formData.get(
          "payment_method"
        ) ||
          "cash_on_delivery"
      );

    /*
     * -------------------------------------------------------
     * DISCOUNT
     * -------------------------------------------------------
     */

    const discountAmount =
      Math.max(
        0,
        Number(
          formData.get(
            "discount_amount"
          ) || 0
        )
      );

    /*
     * -------------------------------------------------------
     * DELIVERY CHARGE
     *
     * Store sale = always 0
     * Online order = supplied amount
     * -------------------------------------------------------
     */

    const deliveryCharge =
      orderSource === "store"
        ? 0
        : Math.max(
            0,
            Number(
              formData.get(
                "shipping_amount"
              ) || 0
            )
          );

    /*
     * -------------------------------------------------------
     * VALIDATION
     * -------------------------------------------------------
     */

    if (!customerName) {
      return {
        success: false,
        error:
          "Customer name is required.",
      };
    }

    /*
     * Online order requires phone.
     *
     * Store sale does not require
     * customer phone.
     */

    if (
      orderSource === "online" &&
      !customerPhone
    ) {
      return {
        success: false,
        error:
          "Customer phone is required.",
      };
    }

    /*
     * -------------------------------------------------------
     * LOAD PRODUCTS
     * -------------------------------------------------------
     */

    const productIds = items.map(
      (item) => item.product_id
    );

    const {
      data: products,
      error: productsError,
    } = await supabase
      .from("products")
      .select(
        `
          id,
          name,
          sku,
          color,
          size,
          purchase_cost,
          regular_price,
          sale_price,
          stock_quantity
        `
      )
      .in("id", productIds);

    if (productsError) {
      throw productsError;
    }

    if (
      !products ||
      products.length !==
        productIds.length
    ) {
      return {
        success: false,
        error:
          "One or more selected products no longer exist.",
      };
    }

    /*
     * -------------------------------------------------------
     * VALIDATE STOCK
     * + BUILD ORDER ITEMS
     * -------------------------------------------------------
     */

    const orderItems: {
      product_id: string;
      product_name: string;
      sku: string | null;
      variant_id: string | null;
      color: string | null;
      size: string | null;
      quantity: number;
      unit_price: number;
      line_total: number;
      purchase_cost: number;
    }[] = [];

    let subtotal = 0;

    for (const item of items) {
      const product =
        products.find(
          (product) =>
            product.id ===
            item.product_id
        );

      if (!product) {
        return {
          success: false,
          error:
            "Selected product was not found.",
        };
      }

      const quantity =
        Number(item.quantity);

      if (
        !Number.isInteger(
          quantity
        ) ||
        quantity <= 0
      ) {
        return {
          success: false,
          error:
            `Invalid quantity for ${product.name}.`,
        };
      }

      /*
       * Server-side stock validation.
       */

      if (
        Number(
          product.stock_quantity
        ) < quantity
      ) {
        return {
          success: false,
          error:
            `${product.name} has only ${product.stock_quantity} pcs available.`,
        };
      }

      /*
       * Sale price if available,
       * otherwise regular price.
       */

      const unitPrice =
        Number(
          product.sale_price ??
            product.regular_price
        );

      const lineTotal =
        unitPrice * quantity;

      subtotal += lineTotal;

      /*
       * Snapshot purchase cost at the
       * time of sale.
       */

      orderItems.push({
        product_id:
          product.id,

        product_name:
          product.name,

        sku:
          product.sku,

        variant_id:
          null,

        color:
          product.color,

        size:
          product.size,

        quantity,

        unit_price:
          unitPrice,

        line_total:
          lineTotal,

        purchase_cost:
          Number(
            product.purchase_cost || 0
          ),
      });
    }

    /*
     * -------------------------------------------------------
     * DISCOUNT VALIDATION
     * -------------------------------------------------------
     */

    if (
      discountAmount >
      subtotal
    ) {
      return {
        success: false,
        error:
          "Discount cannot be greater than subtotal.",
      };
    }

    /*
     * -------------------------------------------------------
     * TOTAL
     * -------------------------------------------------------
     */

    const totalAmount =
      subtotal -
      discountAmount +
      deliveryCharge;

    /*
     * Prevent unused-variable issue
     * while keeping total calculation
     * explicit for order creation.
     */

    void totalAmount;

    /*
     * -------------------------------------------------------
     * PAYMENT / ORDER STATUS
     * -------------------------------------------------------
     *
     * Store:
     * payment = paid
     * status = confirmed
     *
     * Online:
     * payment = pending
     * status = pending
     * -------------------------------------------------------
     */

    const paymentStatus =
      orderSource === "store"
        ? "paid"
        : "pending";

    const orderStatus =
      orderSource === "store"
        ? "confirmed"
        : "pending";

    /*
     * -------------------------------------------------------
     * CREATE ORDER
     * -------------------------------------------------------
     */

    const {
      data: order,
      error: orderError,
    } = await supabase
      .from("orders")
      .insert({
        order_number:
          generateOrderNumber(),

        customer_name:
          customerName,

        customer_phone:
          customerPhone ||
          "N/A",

        customer_email:
          customerEmail,

        delivery_address:
          deliveryAddress,

        district:
          null,

        notes,

        subtotal,

        delivery_charge:
          deliveryCharge,

        discount_amount:
          discountAmount,

        payment_method:
          paymentMethod,

        payment_status:
          paymentStatus,

        order_status:
          orderStatus,

        order_source:
          orderSource,
      })
      .select("id")
      .single();

    if (orderError) {
      throw orderError;
    }

    /*
     * -------------------------------------------------------
     * CREATE ORDER ITEMS
     * -------------------------------------------------------
     */

    const itemsToInsert =
      orderItems.map(
        (item) => ({
          order_id:
            order.id,

          product_id:
            item.product_id,

          variant_id:
            item.variant_id,

          product_name:
            item.product_name,

          sku:
            item.sku,

          color:
            item.color,

          size:
            item.size,

          quantity:
            item.quantity,

          unit_price:
            item.unit_price,

          line_total:
            item.line_total,

          purchase_cost:
            item.purchase_cost,
        })
      );

    const {
      error: orderItemsError,
    } = await supabase
      .from("order_items")
      .insert(
        itemsToInsert
      );

    if (orderItemsError) {
      /*
       * Roll back order if
       * order items fail.
       */

      await supabase
        .from("orders")
        .delete()
        .eq(
          "id",
          order.id
        );

      throw orderItemsError;
    }

    /*
     * -------------------------------------------------------
     * DEDUCT STOCK
     * -------------------------------------------------------
     */

    const updatedProducts: string[] =
      [];

    for (const item of orderItems) {
      const product =
        products.find(
          (product) =>
            product.id ===
            item.product_id
        );

      if (!product) {
        throw new Error(
          "Product not found during stock update."
        );
      }

      const newStock =
        Number(
          product.stock_quantity
        ) -
        Number(item.quantity);

      const {
        data: updatedProduct,
        error: stockError,
      } = await supabase
        .from("products")
        .update({
          stock_quantity:
            newStock,
        })
        .eq(
          "id",
          item.product_id
        )
        .select("id")
        .single();

      if (
        stockError ||
        !updatedProduct
      ) {
        /*
         * Restore previously updated
         * products if stock update fails.
         */

        for (const updatedId of updatedProducts) {
          const original =
            products.find(
              (product) =>
                product.id ===
                updatedId
            );

          if (original) {
            await supabase
              .from("products")
              .update({
                stock_quantity:
                  Number(
                    original.stock_quantity
                  ),
              })
              .eq(
                "id",
                updatedId
              );
          }
        }

        /*
         * Remove created order items.
         */

        await supabase
          .from("order_items")
          .delete()
          .eq(
            "order_id",
            order.id
          );

        /*
         * Remove created order.
         */

        await supabase
          .from("orders")
          .delete()
          .eq(
            "id",
            order.id
          );

        throw (
          stockError ||
          new Error(
            "Unable to update product stock."
          )
        );
      }

      updatedProducts.push(
        item.product_id
      );
    }

    /*
     * -------------------------------------------------------
     * REVALIDATE
     * -------------------------------------------------------
     */

    revalidatePath(
      "/admin/orders"
    );

    revalidatePath(
      "/admin/products"
    );

    revalidatePath(
      "/admin/products/inventory"
    );

    revalidatePath(
      "/admin/dashboard"
    );

    /*
     * -------------------------------------------------------
     * SUCCESS
     * -------------------------------------------------------
     */

    return {
      success: true,
      orderId: order.id,
    };
} catch (error) {
  console.error(
    "createOrder error:",
    error
  );

  if (
    error &&
    typeof error === "object"
  ) {
    const supabaseError =
      error as {
        message?: string;
        details?: string;
        hint?: string;
        code?: string;
      };

    console.error(
      "Supabase error details:",
      {
        message:
          supabaseError.message,
        details:
          supabaseError.details,
        hint:
          supabaseError.hint,
        code:
          supabaseError.code,
      }
    );

    return {
      success: false,
      error:
        supabaseError.message ||
        "Unable to create order.",
    };
  }

  return {
    success: false,
    error:
      error instanceof Error
        ? error.message
        : "Unable to create order.",
  };
}
}