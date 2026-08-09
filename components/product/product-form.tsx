"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Brand } from "@/types/brand";
import type { Product } from "@/types/product";

import {
  createProduct,
  updateProduct,
} from "@/lib/actions/product";

type ProductCategory = {
  id: string;
  name: string;
};

type ProductFormProps = {
  categories: ProductCategory[];
  brands: Brand[];
  product?: Product;
};

export function ProductForm({
  categories,
  brands,
  product,
}: ProductFormProps) {
  const router = useRouter();

  const isEditMode = Boolean(product);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(
        event.currentTarget
      );
      if (isEditMode) {
      await updateProduct(
      product!.id,
      formData
      );
     } else {
      await createProduct(formData);
    }


      router.refresh();
    } catch (error) {
      /*
       * Next.js redirect() throws internally.
       * Do not show redirect as an error.
       */

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong.";

      if (
        !message.includes(
          "NEXT_REDIRECT"
        )
      ) {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* Basic Information */}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Basic Information
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Basic product details and
            classification.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Category */}

          <div>
            <label
              htmlFor="category_id"
              className="mb-2 block text-sm font-medium"
            >
              Category
            </label>

            <select
              id="category_id"
              name="category_id"
              required
              defaultValue={
                product?.category_id || ""
              }
              className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              <option value="">
                Select category
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Brand */}

          <div>
            <label
              htmlFor="brand_id"
              className="mb-2 block text-sm font-medium"
            >
              Brand
            </label>

            <select
              id="brand_id"
              name="brand_id"
              defaultValue={
                product?.brand_id || ""
              }
              className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              <option value="">
                No brand
              </option>

              {brands
                .filter(
                  (brand) =>
                    brand.is_active ||
                    brand.id ===
                      product?.brand_id
                )
                .map((brand) => (
                  <option
                    key={brand.id}
                    value={brand.id}
                  >
                    {brand.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Name */}

          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium"
            >
              Product Name
            </label>

            <input
              id="name"
              name="name"
              required
              defaultValue={
                product?.name || ""
              }
              placeholder="Enter product name"
              className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Slug */}

          <div>
            <label
              htmlFor="slug"
              className="mb-2 block text-sm font-medium"
            >
              Slug
            </label>

            <input
              id="slug"
              name="slug"
              required
              defaultValue={
                product?.slug || ""
              }
              placeholder="product-slug"
              className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* SKU */}

          <div>
            <label
              htmlFor="sku"
              className="mb-2 block text-sm font-medium"
            >
              SKU
            </label>

            <input
              id="sku"
              name="sku"
              defaultValue={
                product?.sku || ""
              }
              placeholder="SKU-001"
              className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>
        </div>

        {/* Short Description */}

        <div className="mt-6">
          <label
            htmlFor="short_description"
            className="mb-2 block text-sm font-medium"
          >
            Short Description
          </label>

          <textarea
            id="short_description"
            name="short_description"
            rows={3}
            defaultValue={
              product?.short_description ||
              ""
            }
            placeholder="Short product description"
            className="w-full rounded-lg border border-neutral-300 px-3 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        {/* Description */}

        <div className="mt-6">
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium"
          >
            Description
          </label>

          <textarea
            id="description"
            name="description"
            rows={7}
            defaultValue={
              product?.description || ""
            }
            placeholder="Detailed product description"
            className="w-full rounded-lg border border-neutral-300 px-3 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>
      </section>

      {/* Pricing */}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Pricing
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Configure product cost and
            selling prices.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <label
              htmlFor="purchase_cost"
              className="mb-2 block text-sm font-medium"
            >
              Purchase Cost
            </label>

            <input
              id="purchase_cost"
              name="purchase_cost"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue={
                product?.purchase_cost ?? 0
              }
              className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label
              htmlFor="regular_price"
              className="mb-2 block text-sm font-medium"
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
                product?.regular_price ?? ""
              }
              className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label
              htmlFor="sale_price"
              className="mb-2 block text-sm font-medium"
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
                product?.sale_price ?? ""
              }
              className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </section>

      {/* Inventory */}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Inventory
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Configure stock quantity and
            low-stock warning.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="stock_quantity"
              className="mb-2 block text-sm font-medium"
            >
              Stock Quantity
            </label>

            <input
              id="stock_quantity"
              name="stock_quantity"
              type="number"
              min="0"
              required
              defaultValue={
                product?.stock_quantity ?? 0
              }
              className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label
              htmlFor="low_stock_threshold"
              className="mb-2 block text-sm font-medium"
            >
              Low Stock Threshold
            </label>

            <input
              id="low_stock_threshold"
              name="low_stock_threshold"
              type="number"
              min="0"
              required
              defaultValue={
                product?.low_stock_threshold ??
                10
              }
              className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </section>

      {/* Settings */}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Product Settings
          </h2>
        </div>

        <div className="space-y-4">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="is_featured"
              defaultChecked={
                product?.is_featured ??
                false
              }
              className="h-4 w-4 rounded border-neutral-300"
            />

            <span className="text-sm font-medium">
              Featured Product
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={
                product?.is_active ??
                true
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

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            SEO
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Optional search engine metadata.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="seo_title"
              className="mb-2 block text-sm font-medium"
            >
              SEO Title
            </label>

            <input
              id="seo_title"
              name="seo_title"
              defaultValue={
                product?.seo_title || ""
              }
              placeholder="SEO title"
              className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label
              htmlFor="seo_description"
              className="mb-2 block text-sm font-medium"
            >
              SEO Description
            </label>

            <textarea
              id="seo_description"
              name="seo_description"
              rows={4}
              defaultValue={
                product?.seo_description ||
                ""
              }
              placeholder="SEO description"
              className="w-full rounded-lg border border-neutral-300 px-3 py-3 outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </section>

      {/* Error */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Actions */}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() =>
            router.push(
              "/admin/products"
            )
          }
          disabled={loading}
          className="rounded-lg border border-neutral-300 px-6 py-3 text-sm font-medium transition hover:bg-neutral-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-sky-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : isEditMode
              ? "Save Changes"
              : "Create Product"}
        </button>
      </div>
    </form>
  );
}