"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  parent_id?: string | null;
};

type Brand = {
  id: string;
  name: string;
};

type ExistingVariant = {
  id: string;
  size: string | null;
  stock_quantity: number | null;
};

type ProductData = {
  id?: string;

  category_id?: string | null;
  brand_id?: string | null;

  name?: string | null;
  slug?: string | null;
  sku?: string | null;

  short_description?: string | null;
  description?: string | null;

  color?: string | null;

  purchase_cost?: number | null;
  regular_price?: number | null;
  sale_price?: number | null;

  stock_quantity?: number | null;
  low_stock_threshold?: number | null;

  is_featured?: boolean;
  is_active?: boolean;

  seo_title?: string | null;
  seo_description?: string | null;

  variants?: ExistingVariant[];
};

type SizeRow = {
  id: string;
  variantId: string | null;
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
  const router = useRouter();

  const isEdit =
    Boolean(product?.id);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const mainCategories = categories.filter(
    (category) =>
      category.parent_id === null
  );

  const initialMainCategory =
    product?.category_id
      ? categories.find(
          (category) =>
            category.id ===
            product.category_id
        )?.parent_id ?? ""
      : "";

  const [selectedMainCategory, setSelectedMainCategory] =
    useState(initialMainCategory);

  /* =======================================================
     INITIAL SIZE ROWS

     IMPORTANT:
     Edit mode loads existing variants.
     Create mode starts with S.
  ======================================================== */

  const [
    sizeRows,
    setSizeRows,
  ] = useState<SizeRow[]>(() => {
    const existingVariants =
      product?.variants ?? [];

    if (
      existingVariants.length > 0
    ) {
      return existingVariants.map(
        (variant) => ({
          id: crypto.randomUUID(),

          variantId:
            variant.id,

          size:
            variant.size ?? "",

          quantity:
            Number(
              variant.stock_quantity ??
                0
            ),
        })
      );
    }

    return [
      {
        id: crypto.randomUUID(),
        variantId: null,
        size: "S",
        quantity: 0,
      },
    ];
  });

  /* =======================================================
     ADD SIZE
  ======================================================== */

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
        variantId: null,
        size:
          nextAvailableSize ?? "",
        quantity: 0,
      },
    ]);
  }

  /* =======================================================
     REMOVE SIZE
  ======================================================== */

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

  /* =======================================================
     UPDATE SIZE
  ======================================================== */

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

  /* =======================================================
     UPDATE QUANTITY
  ======================================================== */

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

  /* =======================================================
     TOTAL STOCK
  ======================================================== */

  const totalStock =
    sizeRows.reduce(
      (total, row) =>
        total + row.quantity,
      0
    );

  /* =======================================================
     SUBMIT
  ======================================================== */

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

      if (isEdit) {
        await updateProduct(
          product!.id!,
          formData
        );
      } else {
        await createProduct(
          formData
        );
      }
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
      {/* =================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* =================================================
          BASIC INFORMATION
      ================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-950">
            Basic Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Enter the main information about this product.
          </p>
        </div>

        {/* =================================================
            BASIC INFORMATION FIELDS
        ================================================== */}

        <div className="grid gap-4 xl:grid-cols-7">

          <div>
            <label
              htmlFor="main_category"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Main Category
            </label>

            <select
              id="main_category"
              value={selectedMainCategory}
              onChange={(event) => {
                setSelectedMainCategory(event.target.value);

                const categorySelect =
                  document.getElementById(
                    "category_id"
                  ) as HTMLSelectElement | null;

                if (categorySelect) {
                  categorySelect.value = "";
                }
              }}
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select main category</option>

              {mainCategories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

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
              defaultValue={product?.category_id ?? ""}
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select category</option>

              {categories
                .filter(
                  (category) =>
                    category.parent_id !== null &&
                    (!selectedMainCategory ||
                      category.parent_id ===
                        selectedMainCategory)
                )
                .map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
            </select>
          </div>

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
              defaultValue={product?.brand_id ?? ""}
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">No brand</option>

              {brands.map((brand) => (
                <option
                  key={brand.id}
                  value={brand.id}
                >
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

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
              defaultValue={product?.name ?? ""}
              placeholder="Enter product name"
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

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
              defaultValue={product?.slug ?? ""}
              placeholder="product-slug"
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

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
              defaultValue={product?.sku ?? ""}
              placeholder="SKU-001"
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

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
              defaultValue={product?.color ?? ""}
              placeholder="e.g. Red"
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">

          <div>
            <label
              htmlFor="short_description"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Short Description
            </label>

            <textarea
              id="short_description"
              name="short_description"
              rows={5}
              defaultValue={product?.short_description ?? ""}
              placeholder="Short product description"
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={product?.description ?? ""}
              placeholder="Detailed product description"
              className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

      </section>

      {/* =================================================
          PRICING
      ================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-950">
            Pricing
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Configure purchase and selling prices.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">

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
              required
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
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

        </div>

        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Regular and sale prices will be applied to the product variants.
        </div>

      </section>

      {/* =================================================
          INVENTORY / SIZE
      ================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Product Sizes & Inventory
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage available sizes and stock quantity.
            </p>
          </div>

          <button
            type="button"
            onClick={addSize}
            disabled={
              sizeRows.length >=
              DEFAULT_SIZES.length
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={17} />
            Add Size
          </button>

        </div>

        {/* =================================================
            SIZE ROWS
        ================================================== */}

        <div className="space-y-4">

          {sizeRows.map(
            (row, index) => (
              <div
                key={row.id}
                className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_1fr_auto]"
              >

                {/* Hidden existing variant ID */}

                <input
                  type="hidden"
                  name={`variant_id_${index}`}
                  value={
                    row.variantId ??
                    ""
                  }
                />

                {/* Size */}

                <div>
                  <label
                    htmlFor={`size-${row.id}`}
                    className="mb-2 block text-sm font-medium text-slate-800"
                  >
                    Size
                  </label>

                  <select
                    id={`size-${row.id}`}
                    name={`size_${index}`}
                    value={row.size}
                    onChange={(event) =>
                      updateSize(
                        row.id,
                        event.target.value
                      )
                    }
                    required
                    className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      Select size
                    </option>

                    {DEFAULT_SIZES.map(
                      (size) => (
                        <option
                          key={size}
                          value={size}
                        >
                          {size}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Quantity */}

                <div>
                  <label
                    htmlFor={`quantity-${row.id}`}
                    className="mb-2 block text-sm font-medium text-slate-800"
                  >
                    Quantity
                  </label>

                  <input
                    id={`quantity-${row.id}`}
                    name={`quantity_${index}`}
                    type="number"
                    min="0"
                    step="1"
                    value={
                      row.quantity
                    }
                    onChange={(event) =>
                      updateQuantity(
                        row.id,
                        event.target.value
                      )
                    }
                    className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    className="flex h-12 w-12 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
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

        <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

          <span className="text-sm font-medium text-slate-600">
            Total Stock
          </span>

          <span className="text-lg font-bold text-slate-950">
            {totalStock} pcs
          </span>

        </div>

        <input
          type="hidden"
          name="stock_quantity"
          value={totalStock}
        />

        {/* =================================================
            LOW STOCK THRESHOLD
        ================================================== */}

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
            step="1"
            defaultValue={
              product?.low_stock_threshold ??
              3
            }
            className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <p className="mt-1.5 text-xs text-slate-500">
            Product will be considered low stock at this quantity.
          </p>

        </div>

      </section>

      {/* =================================================
          PRODUCT SETTINGS
      ================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

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
                Show this product in featured sections.
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
                Make this product visible in the store.
              </p>
            </div>

          </label>

        </div>

      </section>

      {/* =================================================
          SEO
      ================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-950">
            SEO Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Optional information for search engine optimization.
          </p>
        </div>

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
            defaultValue={
              product?.seo_title ??
              ""
            }
            placeholder="SEO title"
            className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* SEO Description */}

        <div className="mt-5">

          <label
            htmlFor="seo_description"
            className="mb-2 block text-sm font-medium text-slate-800"
          >
            SEO Description
          </label>

          <textarea
            id="seo_description"
            name="seo_description"
            rows={4}
            defaultValue={
              product?.seo_description ??
              ""
            }
            placeholder="SEO description"
            className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

        </div>

      </section>

      {/* =================================================
          ACTIONS
      ================================================== */}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

        <button
          type="button"
          onClick={() =>
            router.push(
              "/admin/products"
            )
          }
          disabled={loading}
          className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-medium transition hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={17} />

          {loading
            ? isEdit
              ? "Updating..."
              : "Saving..."
            : isEdit
              ? "Update Product"
              : "Save Product"}
        </button>

      </div>

    </form>
  );
}