"use client";

import Link from "next/link";
import { Save, X } from "lucide-react";
import { useFormStatus } from "react-dom";

import {
  createCategory,
  updateCategory,
} from "@/lib/actions/category";

import type { Category } from "@/types/category";

type CategoryFormProps = {
  mode?: "create" | "edit";
  category?: Category;
  parentCategories?: Category[];
};

/* =========================================================
   SUBMIT BUTTON
========================================================= */

function SubmitButton({
  mode,
}: {
  mode: "create" | "edit";
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Save size={17} />

      {pending
        ? "Saving..."
        : mode === "edit"
        ? "Update Category"
        : "Save Category"}
    </button>
  );
}

/* =========================================================
   CATEGORY FORM
========================================================= */

export function CategoryForm({
  mode = "create",
  category,
  parentCategories = [],
}: CategoryFormProps) {
  const action =
    mode === "edit" && category
      ? updateCategory.bind(null, category.id)
      : createCategory;

  return (
    <form
      action={action}
      className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      {/* =====================================================
          TOP CATEGORY
      ====================================================== */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-800">
          Top Category
          <span className="ml-1 text-red-500">*</span>
        </label>

        <select
          name="parent_id"
          required
          defaultValue={category?.parent_id ?? ""}
          className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">
            Select Top Category
          </option>

          {parentCategories
            .filter(
              (parent) =>
                parent.id !== category?.id
            )
            .map((parent) => (
              <option
                key={parent.id}
                value={parent.id}
              >
                {parent.name}
              </option>
            ))}
        </select>

        <p className="mt-2 text-sm text-slate-500">
          Select the main category under which
          this category will be created.
        </p>
      </div>

      {/* =====================================================
          CATEGORY INFORMATION
      ====================================================== */}

      <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Category Name */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-800">
            Category Name
            <span className="ml-1 text-red-500">*</span>
          </label>

          <input
            name="name"
            required
            defaultValue={category?.name ?? ""}
            placeholder="e.g. Shirts"
            className="h-12 w-full rounded-lg border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-800">
            Slug
            <span className="ml-1 text-red-500">*</span>
          </label>

          <input
            name="slug"
            required
            defaultValue={category?.slug ?? ""}
            placeholder="e.g. shirts"
            className="h-12 w-full rounded-lg border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-800">
            Description
          </label>

          <input
            name="description"
            defaultValue={
              category?.description ?? ""
            }
            placeholder="Optional description"
            className="h-12 w-full rounded-lg border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* =====================================================
          ACTIVE CATEGORY
      ====================================================== */}

      <div className="mt-7 border-t border-slate-200 pt-6">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            name="is_active"
            type="checkbox"
            defaultChecked={
              category?.is_active ?? true
            }
            className="mt-1 h-4 w-4 rounded border-slate-300"
          />

          <div>
            <span className="block text-sm font-semibold text-slate-800">
              Active Category
            </span>

            <span className="mt-1 block text-sm text-slate-500">
              Active categories will be available
              for products and visible on the
              storefront.
            </span>
          </div>
        </label>
      </div>

      {/* =====================================================
          ACTION BUTTONS
      ====================================================== */}

      <div className="mt-7 flex items-center gap-3 border-t border-slate-200 pt-6">
        <SubmitButton mode={mode} />

        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <X size={17} />
          Cancel
        </Link>
      </div>
    </form>
  );
}