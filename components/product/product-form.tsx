"use client";

import { useMemo } from "react";

import { createProduct } from "@/lib/actions/product";

type Category = {
  id: string;
  name: string;
};

type ProductFormProps = {
  categories: Category[];
};

export function ProductForm({
  categories,
}: ProductFormProps) {
  const slug = useMemo(() => "", []);

  return (
    <form
      action={createProduct}
      className="space-y-6 rounded-2xl border bg-white p-6"
    >
      {/* Category */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Category
        </label>

        <select
          name="category_id"
          required
          className="w-full rounded-lg border px-4 py-3"
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

      {/* Name */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Product Name
        </label>

        <input
          name="name"
          required
          className="w-full rounded-lg border px-4 py-3"
        />
      </div>

      {/* Slug */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Slug
        </label>

        <input
          name="slug"
          defaultValue={slug}
          required
          className="w-full rounded-lg border px-4 py-3"
        />
      </div>

      {/* SKU */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          SKU
        </label>

        <input
          name="sku"
          className="w-full rounded-lg border px-4 py-3"
        />
      </div>

      {/* Short Description */}
      {/* Description */}

<div>
  <label className="mb-2 block text-sm font-medium">
    Description
  </label>

  <textarea
    name="description"
    rows={6}
    className="w-full rounded-lg border px-4 py-3"
  />
</div>

{/* Purchase Cost */}

<div className="grid grid-cols-3 gap-4">
  <div>
    <label className="mb-2 block text-sm font-medium">
      Purchase Cost
    </label>

    <input
      type="number"
      step="0.01"
      min="0"
      name="purchase_cost"
      defaultValue="0"
      required
      className="w-full rounded-lg border px-4 py-3"
    />
  </div>

  <div>
    <label className="mb-2 block text-sm font-medium">
      Regular Price
    </label>

    <input
      type="number"
      step="0.01"
      min="0"
      name="regular_price"
      required
      className="w-full rounded-lg border px-4 py-3"
    />
  </div>

  <div>
    <label className="mb-2 block text-sm font-medium">
      Sale Price
    </label>

    <input
      type="number"
      step="0.01"
      min="0"
      name="sale_price"
      className="w-full rounded-lg border px-4 py-3"
    />
  </div>
</div>

{/* Inventory */}

<div className="grid grid-cols-2 gap-4">
  <div>
    <label className="mb-2 block text-sm font-medium">
      Stock Quantity
    </label>

    <input
      type="number"
      min="0"
      name="stock_quantity"
      defaultValue="0"
      required
      className="w-full rounded-lg border px-4 py-3"
    />
  </div>

  <div>
    <label className="mb-2 block text-sm font-medium">
      Low Stock Alert
    </label>

    <input
      type="number"
      min="0"
      name="low_stock_threshold"
      defaultValue="10"
      required
      className="w-full rounded-lg border px-4 py-3"
    />
  </div>
</div>

{/* SEO */}

<div>
  <label className="mb-2 block text-sm font-medium">
    SEO Title
  </label>

  <input
    name="seo_title"
    className="w-full rounded-lg border px-4 py-3"
  />
</div>

<div>
  <label className="mb-2 block text-sm font-medium">
    SEO Description
  </label>

  <textarea
    rows={3}
    name="seo_description"
    className="w-full rounded-lg border px-4 py-3"
  />
</div>

{/* Options */}

<div className="flex gap-8">
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      name="is_featured"
    />

    Featured
  </label>

  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      name="is_active"
      defaultChecked
    />

    Active
  </label>
</div>

<button
  type="submit"
  className="rounded-lg bg-sky-600 px-6 py-3 font-medium text-white hover:bg-sky-700"
>
  Save Product
</button>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Short Description
        </label>

        <textarea
          rows={3}
          name="short_description"
          className="w-full rounded-lg border px-4 py-3"
        />
      </div>
    </form>
  );
}