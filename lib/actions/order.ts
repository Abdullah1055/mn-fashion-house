"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

/* =========================================================
   TYPES
========================================================= */

export type CreateOrderItemInput = {
  product_id: string;
  variant_id?: string | null;
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

type ProductRecord = {
  id: string;
  name: string;
  sku: string | null;
  color: string | null;
  size: string | null;
  purchase_cost: number | null;
  regular_price: number | null;
  sale_price: number | null;
  stock_quantity: number | null;
};

type VariantRecord = {
  id: string;
  product_id: string;
  sku: string | null;
  color: string | null;
  size: string | null;
  price: number | null;
  discount_price: number | null;
  stock_quantity: number | null;
};

type BuiltOrderItem = {
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
};

/* =========================================================
   ORDER NUMBER
========================================================= */

function generateOrderNumber() {
  const timestamp =
    Date.now().toString();

  const random =
    Math.floor(
      1000 +
        Math.random() * 9000
    ).toString();

  return `ORD-${timestamp.slice(
    -8
  )}-${random}`;
}

/* =========================================================
   CREATE ORDER
========================================================= */

export async function createOrder(
  formData: FormData,
  items: CreateOrderItemInput[]
): Promise<CreateOrderResult> {
  const supabase =
    await createClient();

  let createdOrderId:
    | string
    | null = null;

  try {
    /* =======================================================
       BASIC VALIDATION
    ======================================================= */

    if (!items.length) {
      return {
        success: false,
        error:
          "Please add at least one product.",
      };
    }

    /* =======================================================
       NORMALIZE ITEMS
       
       Same product + same variant should behave as one
       cart line.
    ======================================================= */

    const normalizedItems =
      items
        .map((item) => ({
          product_id:
            String(
              item.product_id
            ).trim(),

          variant_id:
            item.variant_id
              ? String(
                  item.variant_id
                ).trim()
              : null,

          quantity:
            Number(
              item.quantity
            ),
        }))
        .filter(
          (item) =>
            Boolean(
              item.product_id
            )
        );

    if (
      normalizedItems.length ===
      0
    ) {
      return {
        success: false,
        error:
          "No valid products were selected.",
      };
    }

    /* =======================================================
       ORDER SOURCE
    ======================================================= */

    const orderSource =
      String(
        formData.get(
          "order_source"
        ) || "online"
      ) === "store"
        ? "store"
        : "online";

    /* =======================================================
       CUSTOMER
    ======================================================= */

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

    const district =
      String(
        formData.get(
          "district"
        ) || ""
      ).trim() || null;

    const notes =
      String(
        formData.get("notes") || ""
      ).trim() || null;

    /* =======================================================
       PAYMENT
    ======================================================= */

    const paymentMethod =
      String(
        formData.get(
          "payment_method"
        ) ||
          "cash_on_delivery"
      );

    /* =======================================================
       DISCOUNT
    ======================================================= */

    const discountAmount =
      Math.max(
        0,
        Number(
          formData.get(
            "discount_amount"
          ) || 0
        )
      );

    if (
      !Number.isFinite(
        discountAmount
      )
    ) {
      return {
        success: false,
        error:
          "Invalid discount amount.",
      };
    }

    /* =======================================================
       DELIVERY
    ======================================================= */

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

    if (
      !Number.isFinite(
        deliveryCharge
      )
    ) {
      return {
        success: false,
        error:
          "Invalid delivery charge.",
      };
    }

    /* =======================================================
       CUSTOMER VALIDATION
    ======================================================= */

    if (!customerName) {
      return {
        success: false,
        error:
          "Customer name is required.",
      };
    }

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

    /* =======================================================
       PRODUCT IDS
    ======================================================= */

    const productIds =
      Array.from(
        new Set(
          normalizedItems.map(
            (item) =>
              item.product_id
          )
        )
      );

    /* =======================================================
       LOAD PRODUCTS
    ======================================================= */

    const {
      data: productData,
      error:
        productsError,
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
      .in(
        "id",
        productIds
      );

    if (productsError) {
      throw new Error(
        `Product lookup failed: ${productsError.message}`
      );
    }

    const products =
      (productData ??
        []) as ProductRecord[];

    if (
      products.length !==
      productIds.length
    ) {
      return {
        success: false,
        error:
          "One or more selected products no longer exist.",
      };
    }

    /* =======================================================
       VARIANT IDS
    ======================================================= */

    const variantIds =
      Array.from(
        new Set(
          normalizedItems
            .map(
              (item) =>
                item.variant_id
            )
            .filter(
              (
                id
              ): id is string =>
                Boolean(id)
            )
        )
      );

    /* =======================================================
       LOAD VARIANTS
       
       Online customer checkout uses this.
       
       Store Sale may still use product-level flow because
       current StoreProductSelector sends only product_id.
    ======================================================= */

    let variants: VariantRecord[] =
      [];

    if (
      variantIds.length > 0
    ) {
      const {
        data: variantData,
        error:
          variantsError,
      } = await supabase
        .from(
          "product_variants"
        )
        .select(
          `
            id,
            product_id,
            sku,
            color,
            size,
            price,
            discount_price,
            stock_quantity
          `
        )
        .in(
          "id",
          variantIds
        );

      if (variantsError) {
        throw new Error(
          `Variant lookup failed: ${variantsError.message}`
        );
      }

      variants =
        (variantData ??
          []) as VariantRecord[];

      if (
        variants.length !==
        variantIds.length
      ) {
        return {
          success: false,
          error:
            "One or more selected sizes are no longer available.",
        };
      }
    }

    /* =======================================================
       VALIDATE + BUILD ORDER ITEMS
    ======================================================= */

    const orderItems: BuiltOrderItem[] =
      [];

    let subtotal = 0;

    for (const item of normalizedItems) {
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

      /* -----------------------------------------------------
         QUANTITY
      ----------------------------------------------------- */

      if (
        !Number.isInteger(
          item.quantity
        ) ||
        item.quantity <= 0
      ) {
        return {
          success: false,
          error:
            `Invalid quantity for ${product.name}.`,
        };
      }

      /* =====================================================
         VARIANT-BASED ORDER
         
         Example:
         Polo / Red / L × 2
         Polo / Red / M × 1
      ===================================================== */

      if (item.variant_id) {
        const variant =
          variants.find(
            (variant) =>
              variant.id ===
              item.variant_id
          );

        if (!variant) {
          return {
            success: false,
            error:
              `Selected size for ${product.name} is no longer available.`,
          };
        }

        /* ---------------------------------------------------
           SECURITY CHECK
           
           Variant must belong to selected product.
        --------------------------------------------------- */

        if (
          variant.product_id !==
          product.id
        ) {
          return {
            success: false,
            error:
              "Invalid product variant selected.",
          };
        }

        /* ---------------------------------------------------
           VARIANT STOCK
        --------------------------------------------------- */

        const variantStock =
          Number(
            variant.stock_quantity ??
              0
          );

        if (
          variantStock <
          item.quantity
        ) {
          const optionName =
            [
              variant.color,
              variant.size,
            ]
              .filter(Boolean)
              .join(" / ");

          return {
            success: false,
            error:
              `${product.name}${optionName ? ` (${optionName})` : ""} has only ${variantStock} pcs available.`,
          };
        }

        /* ---------------------------------------------------
           PRICE
           
           Variant price is preferred.
        --------------------------------------------------- */

        const unitPrice =
          Number(
            variant.discount_price ??
              variant.price ??
              product.sale_price ??
              product.regular_price ??
              0
          );

        if (
          !Number.isFinite(
            unitPrice
          )
        ) {
          return {
            success: false,
            error:
              `Invalid price for ${product.name}.`,
          };
        }

        const lineTotal =
          unitPrice *
          item.quantity;

        subtotal +=
          lineTotal;

        orderItems.push({
          product_id:
            product.id,

          product_name:
            product.name,

          sku:
            variant.sku ??
            product.sku ??
            null,

          variant_id:
            variant.id,

          color:
            variant.color ??
            product.color ??
            null,

          size:
            variant.size ??
            null,

          quantity:
            item.quantity,

          unit_price:
            unitPrice,

          line_total:
            lineTotal,

          purchase_cost:
            Number(
              product.purchase_cost ??
                0
            ),
        });

        continue;
      }

      /* =====================================================
         PRODUCT-LEVEL ORDER
         
         Kept for existing Admin Store Selling flow.
      ===================================================== */

      const productStock =
        Number(
          product.stock_quantity ??
            0
        );

      if (
        productStock <
        item.quantity
      ) {
        return {
          success: false,
          error:
            `${product.name} has only ${productStock} pcs available.`,
        };
      }

      const unitPrice =
        Number(
          product.sale_price ??
            product.regular_price ??
            0
        );

      if (
        !Number.isFinite(
          unitPrice
        )
      ) {
        return {
          success: false,
          error:
            `Invalid price for ${product.name}.`,
        };
      }

      const lineTotal =
        unitPrice *
        item.quantity;

      subtotal +=
        lineTotal;

      orderItems.push({
        product_id:
          product.id,

        product_name:
          product.name,

        sku:
          product.sku ??
          null,

        variant_id:
          null,

        color:
          product.color ??
          null,

        size:
          product.size ??
          null,

        quantity:
          item.quantity,

        unit_price:
          unitPrice,

        line_total:
          lineTotal,

        purchase_cost:
          Number(
            product.purchase_cost ??
              0
          ),
      });
    }

    /* =======================================================
       SUBTOTAL VALIDATION
    ======================================================= */

    if (
      !Number.isFinite(
        subtotal
      )
    ) {
      return {
        success: false,
        error:
          "Unable to calculate order subtotal.",
      };
    }

    /* =======================================================
       DISCOUNT VALIDATION
    ======================================================= */

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

    /* =======================================================
       TOTAL
    ======================================================= */

    const totalAmount =
      subtotal -
      discountAmount +
      deliveryCharge;

    if (
      !Number.isFinite(
        totalAmount
      )
    ) {
      return {
        success: false,
        error:
          "Unable to calculate order total.",
      };
    }

    /* =======================================================
       PAYMENT / STATUS
    ======================================================= */

    const paymentStatus =
      orderSource === "store"
        ? "paid"
        : "pending";

    const orderStatus =
      orderSource === "store"
        ? "confirmed"
        : "pending";

    /* =======================================================
       CREATE ORDER
    ======================================================= */

    const {
      data: order,
      error:
        orderError,
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

        district,

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
      throw new Error(
        `Order creation failed: ${orderError.message}`
      );
    }

    if (!order?.id) {
      throw new Error(
        "Order was created but no order ID was returned."
      );
    }

    createdOrderId =
      order.id;

    /* =======================================================
       CREATE ORDER ITEMS
    ======================================================= */

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
      error:
        orderItemsError,
    } = await supabase
      .from(
        "order_items"
      )
      .insert(
        itemsToInsert
      );

    if (
      orderItemsError
    ) {
      throw new Error(
        `Order items creation failed: ${orderItemsError.message}`
      );
    }

    /* =======================================================
       STOCK UPDATE
       
       We aggregate quantity per product first.
       
       Example:
       L × 2
       M × 1
       
       Product total stock decreases by 3 only once.
    ======================================================= */

    const productQuantityMap =
      new Map<
        string,
        number
      >();

    for (const item of orderItems) {
      const current =
        productQuantityMap.get(
          item.product_id
        ) ?? 0;

      productQuantityMap.set(
        item.product_id,
        current +
          item.quantity
      );
    }

    /* =======================================================
       SAVE ORIGINAL PRODUCT STOCK
    ======================================================= */

    const originalProductStocks =
      new Map<
        string,
        number
      >();

    for (const [
      productId,
    ] of productQuantityMap) {
      const product =
        products.find(
          (product) =>
            product.id ===
            productId
        );

      if (!product) {
        throw new Error(
          "Product not found during stock update."
        );
      }

      originalProductStocks.set(
        productId,
        Number(
          product.stock_quantity ??
            0
        )
      );
    }

    /* =======================================================
       UPDATE VARIANT STOCK
    ======================================================= */

    const originalVariantStocks =
      new Map<
        string,
        number
      >();

    try {
      for (const item of orderItems) {
        if (
          !item.variant_id
        ) {
          continue;
        }

        const variant =
          variants.find(
            (variant) =>
              variant.id ===
              item.variant_id
          );

        if (!variant) {
          throw new Error(
            `Variant not found for ${item.product_name}.`
          );
        }

        if (
          !originalVariantStocks.has(
            variant.id
          )
        ) {
          originalVariantStocks.set(
            variant.id,
            Number(
              variant.stock_quantity ??
                0
            )
          );
        }

        const currentStock =
          Number(
            variant.stock_quantity ??
              0
          );

        const newStock =
          currentStock -
          item.quantity;

        if (
          newStock < 0
        ) {
          throw new Error(
            `${item.product_name} (${variant.size ?? "Selected size"}) does not have enough stock.`
          );
        }

        const {
          error:
            variantStockError,
        } = await supabase
          .from(
            "product_variants"
          )
          .update({
            stock_quantity:
              newStock,
          })
          .eq(
            "id",
            variant.id
          );

        if (
          variantStockError
        ) {
          throw new Error(
            `Variant stock update failed: ${variantStockError.message}`
          );
        }

        /*
         * Keep local value updated because the same variant
         * should never be deducted twice accidentally.
         */
        variant.stock_quantity =
          newStock;
      }

      /* =====================================================
         UPDATE PRODUCT TOTAL STOCK
      ===================================================== */

      for (const [
        productId,
        quantity,
      ] of productQuantityMap) {
        const product =
          products.find(
            (product) =>
              product.id ===
              productId
          );

        if (!product) {
          throw new Error(
            "Product not found during total stock update."
          );
        }

        const currentStock =
          Number(
            product.stock_quantity ??
              0
          );

        const newStock =
          currentStock -
          quantity;

        if (
          newStock < 0
        ) {
          throw new Error(
            `${product.name} does not have enough total stock.`
          );
        }

        const {
          error:
            productStockError,
        } = await supabase
          .from("products")
          .update({
            stock_quantity:
              newStock,
          })
          .eq(
            "id",
            productId
          );

        if (
          productStockError
        ) {
          throw new Error(
            `Product stock update failed: ${productStockError.message}`
          );
        }

        product.stock_quantity =
          newStock;
      }
    } catch (stockError) {
      /* =====================================================
         ROLLBACK VARIANT STOCK
      ===================================================== */

      for (const [
        variantId,
        originalStock,
      ] of originalVariantStocks) {
        await supabase
          .from(
            "product_variants"
          )
          .update({
            stock_quantity:
              originalStock,
          })
          .eq(
            "id",
            variantId
          );
      }

      /* =====================================================
         ROLLBACK PRODUCT STOCK
      ===================================================== */

      for (const [
        productId,
        originalStock,
      ] of originalProductStocks) {
        await supabase
          .from("products")
          .update({
            stock_quantity:
              originalStock,
          })
          .eq(
            "id",
            productId
          );
      }

      throw stockError;
    }

    /* =======================================================
       REVALIDATE
    ======================================================= */

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

    revalidatePath(
      "/admin/store-selling"
    );

    revalidatePath(
      "/checkout"
    );

    revalidatePath(
      "/"
    );

    /* =======================================================
       SUCCESS
    ======================================================= */

    return {
      success: true,
      orderId:
        order.id,
    };
  } catch (error) {
    console.error(
      "================================================="
    );

    console.error(
      "CREATE ORDER FAILED"
    );

    console.error(
      "================================================="
    );

    console.error(
      error
    );

    /* =======================================================
       ROLLBACK ORDER DATA
       
       If order creation succeeded but a later step failed,
       remove the partially-created order.
    ======================================================= */

    if (createdOrderId) {
      await supabase
        .from(
          "order_items"
        )
        .delete()
        .eq(
          "order_id",
          createdOrderId
        );

      await supabase
        .from("orders")
        .delete()
        .eq(
          "id",
          createdOrderId
        );
    }

    /* =======================================================
       RETURN ACTUAL ERROR
    ======================================================= */

    if (
      error instanceof Error
    ) {
      return {
        success: false,
        error:
          error.message,
      };
    }

    if (
      error &&
      typeof error ===
        "object"
    ) {
      const supabaseError =
        error as {
          message?: string;
          details?: string;
          hint?: string;
          code?: string;
        };

      const details = [
        supabaseError.message,
        supabaseError.details,
        supabaseError.hint,
      ]
        .filter(Boolean)
        .join(" | ");

      return {
        success: false,
        error:
          details ||
          "Unable to create order.",
      };
    }

    return {
      success: false,
      error:
        "Unable to create order.",
    };
  }
}