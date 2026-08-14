"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Brand } from "@/types/brand";
import type { Product } from "@/types/product";

import {
  createProduct,
  updateProduct,
} from "@/lib/actions/product";

import { ProductVariantBuilder } from "@/components/product/product-variant-builder";

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
      const formData =
        new FormData(
          event.currentTarget
        );

      if (isEditMode) {
        await updateProduct(
          product!.id,
          formData
        );
      } else {
        await createProduct(
          formData
        );
      }

      router.refresh();
    } catch (error) {
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
      {/* =====================================================
          BASIC INFORMATION
      ====================================================== */}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-2">
          <h2 className="text-lg font-semibold">
            Basic Information
          </h2>
        </div>

        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
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

          {/* Product Name */}

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
              Product SKU
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

        {/* =====================================================
            DESCRIPTIONS
        ====================================================== */}

        <div className="mt-1 grid gap-2 md:grid-cols-2">
          {/* Short Description */}

          <div>
            <label
              htmlFor="short_description"
              className="mb-1 block text-sm font-medium"
            >
              Short Description
            </label>

            <textarea
              id="short_description"
              name="short_description"
              rows={2}
              defaultValue={
                product?.short_description ||
                ""
              }
              placeholder="Short product description"
              className="w-full rounded-lg border border-neutral-300 px-3 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Description */}

          <div>
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows={2}
              defaultValue={
                product?.description ||
                ""
              }
              placeholder="Detailed product description"
              className="w-full rounded-lg border border-neutral-300 px-3 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>
        </div>
      </section>
{/* =====================================================
    PRICING AND STOCK
====================================================== */}

<section className="rounded-2xl border bg-white p-2 shadow-sm">
  <div className="mb-2">
    <h2 className="text-lg font-semibold">
      Pricing and Stock
    </h2>
  </div>

  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-7">

    {/* Color */}
    <div>
      <label
        htmlFor="color"
        className="mb-2 block text-sm font-medium"
      >
        Color
      </label>

      <input
        id="color"
        name="color"
        type="text"
        defaultValue=""
        placeholder="Black"
        className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
      />
    </div>

    {/* Size */}
    <div>
      <label
        htmlFor="size"
        className="mb-2 block text-sm font-medium"
      >
        Size
      </label>

      <select
        id="size"
        name="size"
        defaultValue=""
        className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
      >
        <option value="">
          Select size
        </option>
        <option value="S">S</option>
        <option value="M">M</option>
        <option value="L">L</option>
        <option value="XL">XL</option>
        <option value="2XL">2XL</option>
        <option value="3XL">3XL</option>
        <option value="Free Size">
          Free Size
        </option>
      </select>
    </div>

    {/* Purchase Cost */}
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
        defaultValue={product?.purchase_cost ?? 0}
        className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
      />
    </div>

    {/* Regular Price */}
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
        defaultValue={product?.regular_price ?? ""}
        className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
      />
    </div>

    {/* Sale Price */}
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
        defaultValue={product?.sale_price ?? ""}
        className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
      />
    </div>

    {/* Stock Quantity */}
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
        step="1"
        defaultValue={product?.stock_quantity ?? 0}
        className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
      />
    </div>

    {/* Low Stock Threshold */}
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
        step="1"
        defaultValue={
          product?.low_stock_threshold ?? 5
        }
        className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
      />
    </div>

  </div>
</section>

      {/* =====================================================
          SETTINGS
      ====================================================== */}

      <section className="rounded-2xl border bg-white p-4 shadow-sm">
  <div className="mb-3">
    <h2 className="text-lg font-semibold">
      Product Settings
    </h2>
  </div>

  <div className="flex flex-wrap items-center gap-6">
    {/* Featured Product */}
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        name="is_featured"
        defaultChecked={
          product?.is_featured ?? false
        }
        className="h-4 w-4 rounded border-neutral-300"
      />

      <span className="text-sm font-medium">
        Featured Product
      </span>
    </label>

    {/* Active Product */}
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        name="is_active"
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
      {/* =====================================================
          SEO
      ====================================================== */}
       <section className="rounded-2xl border bg-white p-2 shadow-sm">
  <div className="mb-4">
    <h2 className="text-lg font-semibold">
      SEO
    </h2>
  </div>

  <div className="grid gap-2 md:grid-cols-2">
    {/* SEO Title */}

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

    {/* SEO Description */}

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
        rows={2}
        defaultValue={
          product?.seo_description || ""
        }
        placeholder="SEO description"
        className="w-full rounded-lg border border-neutral-300 px-3 py-3 outline-none focus:border-sky-500"
      />
    </div>
  </div>
</section>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          ACTIONS
      ====================================================== */}

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