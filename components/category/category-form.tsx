"use client";

import { useMemo } from "react";
import { useFormStatus } from "react-dom";

import {
  createCategory,
  updateCategory,
} from "@/lib/actions/category";

import type { Category } from "@/types/category";

type CategoryFormProps = {
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
      className="rounded-lg bg-sky-600 px-6 py-3 font-medium text-white hover:bg-sky-700 disabled:opacity-50"
    >
      {pending
        ? "Saving..."
        : mode === "edit"
        ? "Update Category"
        : "Save Category"}
    </button>
  );
}

export function CategoryForm({
  mode = "create",
  category,
}: CategoryFormProps) {
  const slug = useMemo(
    () => category?.slug ?? "",
    [category]
  );

  const action =
    mode === "edit" && category
      ? updateCategory.bind(null, category.id)
      : createCategory;

  return (
    <form
      action={action}
      className="space-y-6 rounded-2xl border bg-white p-6"
    >
      <div>
        <label className="mb-2 block text-sm font-medium">
          Category Name
        </label>

        <input
          name="name"
          required
          defaultValue={category?.name ?? ""}
          className="w-full rounded-lg border px-4 py-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Slug
        </label>

        <input
          name="slug"
          required
          defaultValue={slug}
          className="w-full rounded-lg border px-4 py-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Description
        </label>

        <textarea
          name="description"
          rows={4}
          defaultValue={category?.description ?? ""}
          className="w-full rounded-lg border px-4 py-3"
        />
      </div>

      <label className="flex items-center gap-3">
        <input
          name="is_active"
          type="checkbox"
          defaultChecked={category?.is_active ?? true}
        />

        <span>Active Category</span>
      </label>

      <SubmitButton mode={mode} />
    </form>
  );
}