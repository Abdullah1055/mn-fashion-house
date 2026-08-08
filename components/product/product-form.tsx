"use client";

import { useMemo } from "react";
import { useFormStatus } from "react-dom";

import {
  createProduct,
  updateProduct,
} from "@/lib/actions/product";

import type { Product } from "@/types/product";

type Category = {
  id: string;
  name: string;
};

type ProductFormProps = {
  categories: Category[];
  product?: Product;
};

function SubmitButton({
  isEdit,
}: {
  isEdit: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-sky-600 px-6 py-3 font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending
        ? isEdit
          ? "Updating..."
          : "Saving..."
        : isEdit
          ? "Update Product"
          : "Save Product"}
    </button>
  );
}

export function ProductForm({
  categories,
  product,
}: ProductFormProps) {
  const isEdit = Boolean(product);

  const action = useMemo(() => {
    if (product) {
      return updateProduct.bind(null, product.id);
    }

    return createProduct;
  }, [product]);

  return (
    <form
      action={action}
      className="space-y-8 rounded-2xl border bg-white p-6 shadow-sm"
    >
      {/* Basic Information */}

      <section className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">
            Basic Information
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Enter the basic information of your product.
          </p>
        </div>

        {/* Category */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Category
          </label>

          <select
            name="category_id"
            required
            defaultValue={product?.category_id ?? ""}
            className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            <option value="">
              Select Category
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Name */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Product Name
          </label>

          <input
            name="name"
            type="text"
            required
            defaultValue={product?.name ?? ""}
            placeholder="Enter product name"
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        {/* Slug */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Slug
          </label>

          <input
            name="slug"
            type="text"
            required
            defaultValue={product?.slug ?? ""}
            placeholder="product-slug"
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />

          <p className="mt-1 text-xs text-neutral-500">
            Use lowercase letters, numbers and hyphens.
          </p>
        </div>

        {/* SKU */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            SKU
          </label>

          <input
            name="sku"
            type="text"
            defaultValue={product?.sku ?? ""}
            placeholder="e.g. MN-TS-001"
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 uppercase outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        {/* Short Description */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Short Description
          </label>

          <textarea
            name="short_description"
            rows={3}
            defaultValue={
              product?.short_description ?? ""
            }
            placeholder="Short product description"
            className="w-full rounded-lg border border-neutral-300 px-3 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        {/* Description */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Description
          </label>

          <textarea
            name="description"
            rows={7}
            defaultValue={product?.description ?? ""}
            placeholder="Detailed product description"
            className="w-full rounded-lg border border-neutral-300 px-3 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>
      </section>

      {/* Pricing */}

      <section className="space-y-6 border-t pt-8">
        <div>
          <h2 className="text-lg font-semibold">
            Pricing
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Manage purchase and selling prices.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {/* Purchase Cost */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Purchase Cost
            </label>

            <input
              name="purchase_cost"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={
                product?.purchase_cost ?? 0
              }
              className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />

            <p className="mt-1 text-xs text-neutral-500">
              Admin only
            </p>
          </div>

          {/* Regular Price */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Regular Price
            </label>

            <input
              name="regular_price"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={
                product?.regular_price ?? ""
              }
              className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Sale Price */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Sale Price
            </label>

            <input
              name="sale_price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={
                product?.sale_price ?? ""
              }
              placeholder="Optional"
              className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>
        </div>
      </section>

      {/* Inventory */}

      <section className="space-y-6 border-t pt-8">
        <div>
          <h2 className="text-lg font-semibold">
            Inventory
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Manage product stock and low-stock threshold.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Stock */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Stock Quantity
            </label>

            <input
              name="stock_quantity"
              type="number"
              min="0"
              required
              defaultValue={
                product?.stock_quantity ?? 0
              }
              className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Low Stock */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Low Stock Threshold
            </label>

            <input
              name="low_stock_threshold"
              type="number"
              min="0"
              required
              defaultValue={
                product?.low_stock_threshold ?? 10
              }
              className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>
        </div>
      </section>

      {/* Product Settings */}

      <section className="space-y-6 border-t pt-8">
        <div>
          <h2 className="text-lg font-semibold">
            Product Settings
          </h2>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
          <label className="flex items-center gap-3">
            <input
              name="is_featured"
              type="checkbox"
              defaultChecked={
                product?.is_featured ?? false
              }
              className="h-4 w-4 rounded border-neutral-300"
            />

            <span className="text-sm font-medium">
              Featured Product
            </span>
          </label>

          <label className="flex items-center gap-3">
            <input
              name="is_active"
              type="checkbox"
              defaultChecked={
                product?.is_active ?? true
              }
              className="h-4 w-4 rounded border-neutral-300"
            />

            <span className="text-sm font-medium">
              Active Product
            </span>
          </label>
        </div>
      </section>

      {/* SEO */}

      <section className="space-y-6 border-t pt-8">
        <div>
          <h2 className="text-lg font-semibold">
            SEO Information
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Optional information for search engine
            optimization.
          </p>
        </div>

        {/* SEO Title */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            SEO Title
          </label>

          <input
            name="seo_title"
            type="text"
            defaultValue={product?.seo_title ?? ""}
            placeholder="SEO title"
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        {/* SEO Description */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            SEO Description
          </label>

          <textarea
            name="seo_description"
            rows={4}
            defaultValue={
              product?.seo_description ?? ""
            }
            placeholder="SEO description"
            className="w-full rounded-lg border border-neutral-300 px-3 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>
      </section>

      {/* Submit */}

      <div className="flex justify-end border-t pt-6">
        <SubmitButton isEdit={isEdit} />
      </div>
    </form>
  );
}