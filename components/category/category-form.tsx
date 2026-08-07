"use client";

import { useMemo } from "react";
import { useFormStatus } from "react-dom";

import { createCategory } from "@/lib/actions/category";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-sky-600 px-6 py-3 font-medium text-white hover:bg-sky-700 disabled:opacity-50"
    >
      {pending ? "Saving..." : "Save Category"}
    </button>
  );
}

export function CategoryForm() {
  const slug = useMemo(() => "", []);

  return (
    <form
      action={createCategory}
      className="space-y-6 rounded-2xl border bg-white p-6"
    >
      <div>
        <label className="mb-2 block text-sm font-medium">
          Category Name
        </label>

        <input
          name="name"
          type="text"
          required
          className="w-full rounded-lg border px-4 py-3"
        />
      </div>

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

      <div>
        <label className="mb-2 block text-sm font-medium">
          Description
        </label>

        <textarea
          name="description"
          rows={4}
          className="w-full rounded-lg border px-4 py-3"
        />
      </div>

      <label className="flex items-center gap-3">
        <input
          name="is_active"
          type="checkbox"
          defaultChecked
        />

        <span>Active Category</span>
      </label>

      <SubmitButton />
    </form>
  );
}