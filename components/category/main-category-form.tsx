"use client";

import Link from "next/link";
import { Save, X } from "lucide-react";
import { useFormStatus } from "react-dom";

import {
  createMainCategory,
  updateMainCategory,
} from "@/lib/actions/main-category";

import type { Category } from "@/types/category";

type MainCategoryFormProps = {
  mode?: "create" | "edit";
  category?: Category;
};

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
      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Save size={17} />

      {pending
        ? "Saving..."
        : mode === "edit"
          ? "Update Main Category"
          : "Save Main Category"}
    </button>
  );
}

export function MainCategoryForm({
  mode = "create",
  category,
}: MainCategoryFormProps) {
  const action =
    mode === "edit" && category
      ? updateMainCategory.bind(null, category.id)
      : createMainCategory;

  return (
    <form
      action={action}
      className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      {/* =====================================================
          BASIC INFORMATION
      ====================================================== */}

      <div className="grid grid-cols-3 gap-6">
        {/* Category Name */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-800">
            Main Category Name
            <span className="ml-1 text-red-500">*</span>
          </label>

          <input
            name="name"
            required
            defaultValue={category?.name ?? ""}
            placeholder="Enter main category name"
            className="h-12 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
            placeholder="Enter slug (e.g. men)"
            className="h-12 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-800">
            Description
          </label>

          <input
            name="description"
            defaultValue={category?.description ?? ""}
            placeholder="Enter description (optional)"
            className="h-12 w-full rounded-lg border border-slate-300 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* =====================================================
          TOP LEVEL INFO
      ====================================================== */}

      <div className="mt-7 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
        <p className="text-sm font-semibold text-blue-900">
          Top Level Category
        </p>

        <p className="mt-1 text-sm text-blue-700">
          This category will be created as a main category.
          Subcategories such as Shirts, Pants or Punjabi can
          be added later from the Categories section.
        </p>
      </div>

      {/* =====================================================
          ACTIVE
      ====================================================== */}

      <div className="mt-7 border-t border-slate-200 pt-6">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            name="is_active"
            type="checkbox"
            defaultChecked={category?.is_active ?? true}
            className="mt-1 h-4 w-4"
          />

          <div>
            <span className="block text-sm font-semibold text-slate-800">
              Active Main Category
            </span>

            <span className="mt-1 block text-sm text-slate-500">
              Inactive main categories will not be visible
              in the frontend.
            </span>
          </div>
        </label>
      </div>

      {/* =====================================================
          BUTTONS
      ====================================================== */}

      <div className="mt-7 flex items-center gap-3 border-t border-slate-200 pt-6">
        <SubmitButton mode={mode} />

        <Link
          href="/admin/main-categories"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <X size={17} />
          Cancel
        </Link>
      </div>
    </form>
  );
}