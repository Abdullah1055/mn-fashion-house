"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Save,
} from "lucide-react";

import {
  createProduct,
  updateProduct,
} from "@/lib/actions/products.actions";

/* =========================================================
   TYPES
========================================================= */

type Category = {
  id: string;
  name: string;
};

type Brand = {
  id: string;
  name: string;
};

type ProductData = {
  id?: string;

  category_id?: string | null;
  brand_id?: string | null;

  name?: string | null;
  slug?: string | null;
  sku?: string | null;

  short_description?: string | null;

  color?: string | null;

  purchase_cost?: number | null;
  regular_price?: number | null;
  sale_price?: number | null;

  low_stock_threshold?: number | null;

  is_featured?: boolean;
  is_active?: boolean;
};

type SizeRow = {
  id: string;
  size: string;
  quantity: number;
};

type ProductFormProps = {
  categories: Category[];
  brands: Brand[];
  product?: ProductData | null;
};

/* =========================================================
   DEFAULT SIZES
========================================================= */

const DEFAULT_SIZES = [
  "S",
  "M",
  "L",
  "XL",
];

/* =========================================================
   PRODUCT FORM
========================================================= */

export function ProductForm({
  categories,
  brands,
  product,
}: ProductFormProps) {
  const isEdit =
    Boolean(product?.id);

  /* -------------------------------------------------------
     SIZE + QUANTITY STATE
  ------------------------------------------------------- */

  const [
    sizeRows,
    setSizeRows,
  ] = useState<SizeRow[]>([
    {
      id: crypto.randomUUID(),
      size: "S",
      quantity: 0,
    },
  ]);

  /* -------------------------------------------------------
     ADD SIZE
  ------------------------------------------------------- */

  function addSize() {
    const usedSizes =
      new Set(
        sizeRows.map(
          (row) =>
            row.size
              .trim()
              .toUpperCase()
        )
      );

    const nextAvailableSize =
      DEFAULT_SIZES.find(
        (size) =>
          !usedSizes.has(size)
      );

    setSizeRows((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        size:
          nextAvailableSize ||
          "",
        quantity: 0,
      },
    ]);
  }

  /* -------------------------------------------------------
     REMOVE SIZE
  ------------------------------------------------------- */

  function removeSize(
    id: string
  ) {
    setSizeRows((current) =>
      current.filter(
        (row) =>
          row.id !== id
      )
    );
  }

  /* -------------------------------------------------------
     UPDATE SIZE
  ------------------------------------------------------- */

  function updateSize(
    id: string,
    value: string
  ) {
    setSizeRows((current) =>
      current.map((row) =>
        row.id === id
          ? {
              ...row,
              size: value,
            }
          : row
      )
    );
  }

  /* -------------------------------------------------------
     UPDATE QUANTITY
  ------------------------------------------------------- */

  function updateQuantity(
    id: string,
    value: string
  ) {
    const quantity =
      Number(value);

    setSizeRows((current) =>
      current.map((row) =>
        row.id === id
          ? {
              ...row,
              quantity:
                Number.isFinite(
                  quantity
                )
                  ? Math.max(
                      0,
                      Math.floor(
                        quantity
                      )
                    )
                  : 0,
            }
          : row
      )
    );
  }

  /* -------------------------------------------------------
     TOTAL STOCK
  ------------------------------------------------------- */

  const totalStock =
    sizeRows.reduce(
      (
        total,
        row
      ) =>
        total +
        row.quantity,
      0
    );

  return (
    <form
      action={
        isEdit
          ? updateProduct.bind(
              null,
              product!.id!
            )
          : createProduct
      }
      className="space-y-6"
    >
      {/* =====================================================
          BASIC INFORMATION
      ====================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-950">
            Basic Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Enter the main information about this product.
          </p>
        </div>

        {/* ===================================================
            ROW 1 — FIVE FIELDS
        ==================================================== */}

        <div className="grid gap-4 xl:grid-cols-5">

          {/* Category */}
          <div>
            <label
              htmlFor="category_id"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Category
            </label>

            <select
              id="category_id"
              name="category_id"
              required
              defaultValue={
                product?.category_id ??
                ""
              }
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                Select category
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={
                      category.id
                    }
                    value={
                      category.id
                    }
                  >
                    {
                      category.name
                    }
                  </option>
                )
              )}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label
              htmlFor="brand_id"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Brand
            </label>

            <select
              id="brand_id"
              name="brand_id"
              defaultValue={
                product?.brand_id ??
                ""
              }
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                No brand
              </option>

              {brands.map(
                (brand) => (
                  <option
                    key={
                      brand.id
                    }
                    value={
                      brand.id
                    }
                  >
                    {brand.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Product Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Product Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={
                product?.name ??
                ""
              }
              placeholder="Enter product name"
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Slug */}
          <div>
            <label
              htmlFor="slug"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Slug
            </label>

            <input
              id="slug"
              name="slug"
              type="text"
              required
              defaultValue={
                product?.slug ??
                ""
              }
              placeholder="product-slug"
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Product SKU */}
          <div>
            <label
              htmlFor="sku"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Product SKU
            </label>

            <input
              id="sku"
              name="sku"
              type="text"
              defaultValue={
                product?.sku ??
                ""
              }
              placeholder="SKU-001"
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* ===================================================
            SHORT DESCRIPTION
        ==================================================== */}

        <div className="mt-5">
          <label
            htmlFor="short_description"
            className="mb-2 block text-sm font-medium text-slate-800"
          >
            Short Description
          </label>

          <textarea
            id="short_description"
            name="short_description"
            rows={3}
            defaultValue={
              product?.short_description ??
              ""
            }
            placeholder="Short product description"
            className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

      </div>

      {/* =====================================================
          PRICING AND STOCK
      ====================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-950">
            Pricing and Stock
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Set the product color, pricing and size-wise stock.
          </p>
        </div>

        {/* ===================================================
            COLOR + PRICING
        ==================================================== */}

        <div className="grid gap-4 lg:grid-cols-4">

          {/* Color */}
          <div>
            <label
              htmlFor="color"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Color
            </label>

            <input
              id="color"
              name="color"
              type="text"
              defaultValue={
                product?.color ??
                ""
              }
              placeholder="Black"
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Purchase Cost */}
          <div>
            <label
              htmlFor="purchase_cost"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Purchase Cost
            </label>

            <input
              id="purchase_cost"
              name="purchase_cost"
              type="number"
              min="0"
              step="0.01"
              defaultValue={
                product?.purchase_cost ??
                0
              }
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Regular Price */}
          <div>
            <label
              htmlFor="regular_price"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Regular Price
            </label>

            <input
              id="regular_price"
              name="regular_price"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue={
                product?.regular_price ??
                ""
              }
              placeholder="0"
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Sale Price */}
          <div>
            <label
              htmlFor="sale_price"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Sale Price
            </label>

            <input
              id="sale_price"
              name="sale_price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={
                product?.sale_price ??
                ""
              }
              placeholder="Optional"
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

        </div>

        {/* ===================================================
            SIZE + QUANTITY
        ==================================================== */}

        <div className="mt-6">

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

            <div>
              <h3 className="text-base font-semibold text-slate-950">
                Size & Quantity
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Add each available size with its stock quantity.
              </p>
            </div>

            <button
              type="button"
              onClick={addSize}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus size={16} />
              Add Size
            </button>

          </div>

          {/* Size Rows */}

          <div className="space-y-3">

            {sizeRows.map(
              (
                row,
                index
              ) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[1fr_1fr_auto] gap-3"
                >

                  {/* Size */}
                  <div>
                    <label
                      htmlFor={`size_${index}`}
                      className="mb-1.5 block text-xs font-medium text-slate-600"
                    >
                      Size
                    </label>

                    <input
                      id={`size_${index}`}
                      name={`size_${index}`}
                      type="text"
                      value={
                        row.size
                      }
                      onChange={(
                        event
                      ) =>
                        updateSize(
                          row.id,
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="S / M / L / XL"
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label
                      htmlFor={`quantity_${index}`}
                      className="mb-1.5 block text-xs font-medium text-slate-600"
                    >
                      Quantity
                    </label>

                    <input
                      id={`quantity_${index}`}
                      name={`quantity_${index}`}
                      type="number"
                      min="0"
                      value={
                        row.quantity
                      }
                      onChange={(
                        event
                      ) =>
                        updateQuantity(
                          row.id,
                          event
                            .target
                            .value
                        )
                      }
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* Delete */}
                  <div className="flex items-end">

                    <button
                      type="button"
                      onClick={() =>
                        removeSize(
                          row.id
                        )
                      }
                      disabled={
                        sizeRows.length ===
                        1
                      }
                      aria-label="Remove size"
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2
                        size={17}
                      />
                    </button>

                  </div>

                </div>
              )
            )}

          </div>

          {/* =================================================
              TOTAL STOCK
          ================================================== */}

          <div className="mt-5 flex flex-wrap items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

            <span className="text-sm font-medium text-slate-600">
              Total Stock
            </span>

            <span className="text-lg font-bold text-slate-950">
              {totalStock} pcs
            </span>

          </div>

          {/* Hidden total stock */}
          <input
            type="hidden"
            name="stock_quantity"
            value={totalStock}
          />

        </div>

        {/* ===================================================
            LOW STOCK THRESHOLD
        ==================================================== */}

        <div className="mt-6 max-w-sm">

          <label
            htmlFor="low_stock_threshold"
            className="mb-2 block text-sm font-medium text-slate-800"
          >
            Low Stock Threshold
          </label>

          <input
            id="low_stock_threshold"
            name="low_stock_threshold"
            type="number"
            min="0"
            defaultValue={
              product?.low_stock_threshold ??
              3
            }
            className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <p className="mt-1.5 text-xs text-slate-500">
            Default: 3 pcs
          </p>

        </div>

      </div>

      {/* =====================================================
          PRODUCT SETTINGS
      ====================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-950">
            Product Settings
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Control how this product appears in your store.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">

          {/* Featured */}
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">

            <input
              type="checkbox"
              name="is_featured"
              defaultChecked={
                product?.is_featured ??
                false
              }
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Featured Product
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Highlight this product in the store.
              </p>
            </div>

          </label>

          {/* Active */}
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">

            <input
              type="checkbox"
              name="is_active"
              defaultChecked={
                product?.is_active ??
                true
              }
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Active Product
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Make this product available in the store.
              </p>
            </div>

          </label>

        </div>

      </div>

      {/* =====================================================
          SEO
      ====================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-950">
            SEO Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Optional search engine information.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">

          {/* SEO Title */}
          <div>
            <label
              htmlFor="seo_title"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              SEO Title
            </label>

            <input
              id="seo_title"
              name="seo_title"
              type="text"
              placeholder="SEO title"
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* SEO Description */}
          <div>
            <label
              htmlFor="seo_description"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              SEO Description
            </label>

            <textarea
              id="seo_description"
              name="seo_description"
              rows={3}
              placeholder="SEO description"
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

        </div>

      </div>

      {/* =====================================================
          SUBMIT
      ====================================================== */}

      <div className="flex items-center justify-end gap-3">

        <button
          type="submit"
          className="inline-flex h-12 items-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Save size={17} />

          {isEdit
            ? "Update Product"
            : "Create Product"}
        </button>

      </div>

    </form>
  );
}