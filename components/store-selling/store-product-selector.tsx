"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { Product } from "@/types/product";

import {
  createOrder,
  type CreateOrderItemInput,
} from "@/lib/actions/order";

type Props = {
  products: Product[];
};

type SaleItem = {
  product: Product;
  quantity: number;
};

export function StoreProductSelector({
  products,
}: Props) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");

  const [saleItems, setSaleItems] = useState<
    SaleItem[]
  >([]);

  const [discount, setDiscount] =
    useState("0");

  const [paymentMethod, setPaymentMethod] =
    useState("cod");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  /* =========================================================
     CATEGORIES
  ========================================================= */

  const categories = useMemo(() => {
    const map = new Map<string, string>();

    products.forEach((product) => {
      if (
        product.category?.id &&
        product.category.name
      ) {
        map.set(
          product.category.id,
          product.category.name
        );
      }
    });

    return Array.from(map.entries()).sort(
      (a, b) =>
        a[1].localeCompare(b[1])
    );
  }, [products]);

  /* =========================================================
     SIZES
  ========================================================= */

  const sizes = useMemo(() => {
    const uniqueSizes =
      new Set<string>();

    products.forEach((product) => {
      if (product.size) {
        uniqueSizes.add(product.size);
      }
    });

    return Array.from(
      uniqueSizes
    ).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [products]);

  /* =========================================================
     FILTER PRODUCTS
  ========================================================= */

  const filteredProducts =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return products.filter(
        (product) => {
          const matchesSearch =
            !searchValue ||
            product.name
              .toLowerCase()
              .includes(searchValue) ||
            (
              product.sku || ""
            )
              .toLowerCase()
              .includes(searchValue) ||
            (
              product.color || ""
            )
              .toLowerCase()
              .includes(searchValue) ||
            (
              product.size || ""
            )
              .toLowerCase()
              .includes(searchValue);

          const matchesCategory =
            !category ||
            product.category_id ===
              category;

          const matchesSize =
            !size ||
            product.size === size;

          return (
            matchesSearch &&
            matchesCategory &&
            matchesSize
          );
        }
      );
    }, [
      products,
      search,
      category,
      size,
    ]);

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  function clearFilters() {
    setSearch("");
    setCategory("");
    setSize("");
  }

  /* =========================================================
     ADD PRODUCT
  ========================================================= */

  function addProduct(
    product: Product
  ) {
    setError(null);
    setSuccess(null);

    if (
      product.stock_quantity <= 0
    ) {
      return;
    }

    const existingItem =
      saleItems.find(
        (item) =>
          item.product.id ===
          product.id
      );

    if (existingItem) {
      if (
        existingItem.quantity >=
        product.stock_quantity
      ) {
        setError(
          `${product.name} has no more stock available.`
        );

        return;
      }

      setSaleItems(
        (currentItems) =>
          currentItems.map(
            (item) =>
              item.product.id ===
              product.id
                ? {
                    ...item,
                    quantity:
                      item.quantity + 1,
                  }
                : item
          )
      );

      return;
    }

    setSaleItems(
      (currentItems) => [
        ...currentItems,
        {
          product,
          quantity: 1,
        },
      ]
    );
  }

  /* =========================================================
     REMOVE PRODUCT
  ========================================================= */

  function removeProduct(
    productId: string
  ) {
    setSaleItems(
      (currentItems) =>
        currentItems.filter(
          (item) =>
            item.product.id !==
            productId
        )
    );
  }

  /* =========================================================
     INCREASE QUANTITY
  ========================================================= */

  function increaseQuantity(
    productId: string
  ) {
    setSaleItems(
      (currentItems) =>
        currentItems.map(
          (item) => {
            if (
              item.product.id !==
              productId
            ) {
              return item;
            }

            if (
              item.quantity >=
              item.product.stock_quantity
            ) {
              return item;
            }

            return {
              ...item,
              quantity:
                item.quantity + 1,
            };
          }
        )
    );
  }

  /* =========================================================
     DECREASE QUANTITY
  ========================================================= */

  function decreaseQuantity(
    productId: string
  ) {
    setSaleItems(
      (currentItems) =>
        currentItems
          .map((item) => {
            if (
              item.product.id !==
              productId
            ) {
              return item;
            }

            return {
              ...item,
              quantity:
                item.quantity - 1,
            };
          })
          .filter(
            (item) =>
              item.quantity > 0
          )
    );
  }

  /* =========================================================
     TOTALS
  ========================================================= */

  const subtotal =
    saleItems.reduce(
      (total, item) => {
        const price =
          Number(
            item.product.sale_price ??
              item.product.regular_price
          );

        return (
          total +
          price * item.quantity
        );
      },
      0
    );

  const discountValue =
    Math.max(
      0,
      Number(discount) || 0
    );

  const grandTotal =
    subtotal -
    discountValue;

  /* =========================================================
     CONFIRM STORE SALE
  ========================================================= */

  async function handleConfirmSale() {
    setError(null);
    setSuccess(null);

    if (!saleItems.length) {
      setError(
        "Please add at least one product."
      );

      return;
    }

    if (
      discountValue >
      subtotal
    ) {
      setError(
        "Discount cannot be greater than subtotal."
      );

      return;
    }

    const items: CreateOrderItemInput[] =
      saleItems.map(
        (item) => ({
          product_id:
            item.product.id,

          quantity:
            item.quantity,
        })
      );

    try {
      setLoading(true);

      const formData =
        new FormData();

      formData.set(
        "order_source",
        "store"
      );

      formData.set(
        "customer_name",
        "Walk-in Customer"
      );

      formData.set(
        "customer_phone",
        ""
      );

      formData.set(
        "customer_email",
        ""
      );

      formData.set(
        "shipping_address",
        "Store Sale"
      );

      formData.set(
        "district",
        "Store"
      );

      formData.set(
        "notes",
        "Store sale"
      );

      formData.set(
        "payment_method",
        "cod"
      );

      formData.set(
        "shipping_amount",
        "0"
      );

      formData.set(
        "discount_amount",
        String(discountValue)
      );

      const result =
        await createOrder(
          formData,
          items
        );

      if (!result.success) {
        setError(
          result.error ||
            "Unable to complete store sale."
        );

        return;
      }

      /*
       * Store Sale successfully created.
       *
       * The existing createOrder() flow remains
       * unchanged. After successful creation we
       * redirect to the existing Admin Order Detail
       * page so the newly created Store Sale can be
       * viewed immediately.
       *
       * The order action is expected to return the
       * created order ID as `orderId`.
       */

      const orderId =
        (
          result as {
            orderId?: string;
          }
        ).orderId;

      if (!orderId) {
        setError(
          "Store sale was completed, but the order ID could not be found."
        );

        return;
      }

      /*
       * Redirect to the existing order detail page.
       *
       * Example:
       * /admin/orders/063597d9-9381-4b01-8a0d-a9f694df04df
       */
      router.push(
        `/admin/orders/${orderId}`
      );
    } catch {
      setError(
        "Something went wrong while completing the sale."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">

      {/* =====================================================
          FILTERS
      ====================================================== */}

      <div className="grid gap-3 md:grid-cols-4">

        <div className="md:col-span-2">
          <label
            htmlFor="store-product-search"
            className="mb-1.5 block text-sm font-medium text-neutral-900"
          >
            Search Product
          </label>

          <input
            id="store-product-search"
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Product name, SKU, color or size..."
            className="h-10 w-full rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div>
          <label
            htmlFor="store-category"
            className="mb-1.5 block text-sm font-medium text-neutral-900"
          >
            Category
          </label>

          <select
            id="store-category"
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value
              )
            }
            className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            <option value="">
              All Categories
            </option>

            {categories.map(
              ([id, name]) => (
                <option
                  key={id}
                  value={id}
                >
                  {name}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label
            htmlFor="store-size"
            className="mb-1.5 block text-sm font-medium text-neutral-900"
          >
            Size
          </label>

          <select
            id="store-size"
            value={size}
            onChange={(event) =>
              setSize(
                event.target.value
              )
            }
            className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            <option value="">
              All Sizes
            </option>

            {sizes.map(
              (itemSize) => (
                <option
                  key={itemSize}
                  value={itemSize}
                >
                  {itemSize}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* =====================================================
          PRODUCT TABLE
      ====================================================== */}

      <div className="pt-1">

        <div className="overflow-hidden rounded-xl border border-neutral-300">

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">

              <thead className="bg-neutral-50">
                <tr>

                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Product
                  </th>

                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Category
                  </th>

                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Color
                  </th>

                  <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Size
                  </th>

                  <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Available
                  </th>

                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Sale Price
                  </th>

                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredProducts.map(
                  (product) => {

                    const stock =
                      Number(
                        product.stock_quantity
                      );

                    const price =
                      Number(
                        product.sale_price ??
                          product.regular_price
                      );

                    const selectedItem =
                      saleItems.find(
                        (item) =>
                          item.product.id ===
                          product.id
                      );

                    return (
                      <tr
                        key={product.id}
                        className="border-t border-neutral-200 transition hover:bg-neutral-50"
                      >

                        <td className="px-4 py-1.5">
                          <div className="text-sm font-medium text-neutral-900">
                            {product.name}
                          </div>

                          <div className="mt-0.5 text-[11px] text-neutral-500">
                            SKU:{" "}
                            {product.sku ||
                              "-"}
                          </div>
                        </td>

                        <td className="px-4 py-1.5 text-sm text-neutral-600">
                          {product.category
                            ?.name ||
                            "-"}
                        </td>

                        <td className="px-4 py-1.5 text-sm text-neutral-600">
                          {product.color ||
                            "-"}
                        </td>

                        <td className="px-4 py-1.5 text-center text-sm text-neutral-600">
                          {product.size ||
                            "-"}
                        </td>

                        <td className="px-4 py-1.5 text-center">
                          <span
                            className={
                              stock === 0
                                ? "font-semibold text-red-600"
                                : stock <=
                                    product.low_stock_threshold
                                  ? "font-semibold text-amber-600"
                                  : "font-semibold text-neutral-900"
                            }
                          >
                            {stock}
                          </span>
                        </td>

                        <td className="px-4 py-1.5 text-right text-sm font-semibold text-neutral-900">
                          ৳
                          {price.toLocaleString(
                            "en-BD",
                            {
                              minimumFractionDigits:
                                2,
                              maximumFractionDigits:
                                2,
                            }
                          )}
                        </td>

                        <td className="px-4 py-1.5 text-right">
                          <button
                            type="button"
                            disabled={
                              stock <= 0
                            }
                            onClick={() =>
                              addProduct(
                                product
                              )
                            }
                            className="rounded-md bg-sky-600 px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
                          >
                            {selectedItem
                              ? "Add More"
                              : "Select"}
                          </button>
                        </td>

                      </tr>
                    );
                  }
                )}

                {filteredProducts.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-8 text-center"
                    >
                      <p className="font-medium text-neutral-700">
                        No products found
                      </p>

                      <p className="mt-1 text-sm text-neutral-500">
                        Try a different product
                        name, SKU, category or size.
                      </p>
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>

          {/* =================================================
              TABLE FOOTER
          ================================================== */}

          <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-2.5">
            <div className="flex items-center justify-start">

              <p className="text-sm text-neutral-500">
                Showing{" "}
                <span className="font-semibold text-neutral-900">
                  {filteredProducts.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-neutral-900">
                  {products.length}
                </span>{" "}
                products
              </p>

            </div>
          </div>

        </div>

        {/* CLEAR FILTERS */}

        {(search ||
          category ||
          size) && (
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-sky-600 hover:text-sky-700"
            >
              Clear filters
            </button>
          </div>
        )}

      </div>

      {/* =====================================================
          CURRENT SALE
      ====================================================== */}

      {saleItems.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm">

          {/* CURRENT SALE HEADER */}

          <div className="border-b border-sky-100 bg-sky-300 px-5 py-2">

            <div className="flex items-center justify-between">

              <h2 className="text-base font-semibold text-neutral-950">
                Current Sale
              </h2>

              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                {saleItems.length}{" "}
                {saleItems.length ===
                1
                  ? "Item"
                  : "Items"}
              </span>

            </div>

          </div>

          {/* SALE PRODUCTS */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px]">

              <thead className="bg-neutral-50">
                <tr>

                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Product
                  </th>

                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Color
                  </th>

                  <th className="px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Size
                  </th>

                  <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Price
                  </th>

                  <th className="px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Quantity
                  </th>

                  <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Total
                  </th>

                  <th className="px-4 py-2" />

                </tr>
              </thead>

              <tbody>

                {saleItems.map(
                  (item) => {

                    const price =
                      Number(
                        item.product
                          .sale_price ??
                          item.product
                            .regular_price
                      );

                    const total =
                      price *
                      item.quantity;

                    return (
                      <tr
                        key={
                          item.product.id
                        }
                        className="border-t border-neutral-200"
                      >

                        <td className="px-4 py-1.5">
                          <div className="text-sm font-medium text-neutral-900">
                            {
                              item.product
                                .name
                            }
                          </div>

                          <div className="mt-0.5 text-[11px] text-neutral-500">
                            SKU:{" "}
                            {item.product
                              .sku ||
                              "-"}
                          </div>
                        </td>

                        <td className="px-4 py-1.5 text-sm text-neutral-600">
                          {item.product
                            .color ||
                            "-"}
                        </td>

                        <td className="px-4 py-1.5 text-center text-sm text-neutral-600">
                          {item.product
                            .size ||
                            "-"}
                        </td>

                        <td className="px-4 py-1.5 text-right text-sm font-medium">
                          ৳
                          {price.toLocaleString(
                            "en-BD",
                            {
                              minimumFractionDigits:
                                2,
                              maximumFractionDigits:
                                2,
                            }
                          )}
                        </td>

                        <td className="px-4 py-1.5">

                          <div className="flex items-center justify-center gap-1.5">

                            <button
                              type="button"
                              onClick={() =>
                                decreaseQuantity(
                                  item.product
                                    .id
                                )
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-300 text-base font-semibold hover:bg-neutral-100"
                            >
                              −
                            </button>

                            <span className="w-7 text-center text-sm font-semibold">
                              {
                                item.quantity
                              }
                            </span>

                            <button
                              type="button"
                              disabled={
                                item.quantity >=
                                item.product
                                  .stock_quantity
                              }
                              onClick={() =>
                                increaseQuantity(
                                  item.product
                                    .id
                                )
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-300 text-base font-semibold hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              +
                            </button>

                          </div>

                          <p className="mt-0.5 text-center text-[10px] text-neutral-400">
                            Stock:{" "}
                            {
                              item.product
                                .stock_quantity
                            }
                          </p>

                        </td>

                        <td className="px-4 py-1.5 text-right text-sm font-semibold">
                          ৳
                          {total.toLocaleString(
                            "en-BD",
                            {
                              minimumFractionDigits:
                                2,
                              maximumFractionDigits:
                                2,
                            }
                          )}
                        </td>

                        <td className="px-4 py-1.5 text-right">

                          <button
                            type="button"
                            onClick={() =>
                              removeProduct(
                                item.product
                                  .id
                              )
                            }
                            className="text-sm font-medium text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>
            </table>

          </div>

          {/* =================================================
              SALE SUMMARY
          ================================================== */}

          <div className="border-t bg-neutral-50 px-5 py-4">

            <div className="ml-auto max-w-[420px] space-y-3">

              {/* SUBTOTAL */}

              <div className="flex items-center justify-between">

                <span className="text-sm text-neutral-500">
                  Subtotal
                </span>

                <span className="text-sm font-semibold text-neutral-900">
                  ৳
                  {subtotal.toLocaleString(
                    "en-BD",
                    {
                      minimumFractionDigits:
                        2,
                      maximumFractionDigits:
                        2,
                    }
                  )}
                </span>

              </div>

              {/* DISCOUNT */}

              <div>

                <label
                  htmlFor="store-discount"
                  className="mb-1 block text-sm font-medium text-neutral-900"
                >
                  Discount
                </label>

                <input
                  id="store-discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(event) =>
                    setDiscount(
                      event.target.value
                    )
                  }
                  className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />

              </div>

              {/* PAYMENT METHOD */}

              <div>

                <label
                  htmlFor="store-payment"
                  className="mb-1 block text-sm font-medium text-neutral-900"
                >
                  Payment Method
                </label>

                <select
                  id="store-payment"
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(
                      event.target.value
                    )
                  }
                  className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="cod">
                    Cash
                  </option>
                </select>

              </div>

              {/* GRAND TOTAL */}

              <div className="border-t pt-3">

                <div className="flex items-center justify-between">

                  <span className="text-base font-bold text-neutral-950">
                    Grand Total
                  </span>

                  <span className="text-xl font-black text-neutral-950">
                    ৳
                    {grandTotal.toLocaleString(
                      "en-BD",
                      {
                        minimumFractionDigits:
                          2,
                        maximumFractionDigits:
                          2,
                      }
                    )}
                  </span>

                </div>

              </div>

              {/* ERROR */}

              {error && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* SUCCESS */}

              {success && (
                <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                  {success}
                </div>
              )}

              {/* CONFIRM */}

              <button
                type="button"
                onClick={
                  handleConfirmSale
                }
                disabled={loading}
                className="h-10 w-full rounded-lg bg-green-600 px-6 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Completing Sale..."
                  : "Confirm Store Sale"}
              </button>

            </div>

          </div>

        </section>
      )}

    </div>
  );
}