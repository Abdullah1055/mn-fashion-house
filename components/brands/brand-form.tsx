"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createBrand } from "@/lib/actions/brand";

export function BrandForm() {
  const router = useRouter();

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

      const result =
        await createBrand(formData);

      if (!result.success) {
        setError(
          result.error ||
            "Unable to create brand."
        );
        return;
      }

      router.push("/admin/brands");
      router.refresh();
    } catch {
      setError(
        "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl space-y-6"
    >
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Brand Name
            </label>

            <input
              name="name"
              required
              placeholder="e.g. Nike"
              className="h-11 w-full rounded-lg border px-3 outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Logo URL
            </label>

            <input
              name="logo_url"
              placeholder="https://..."
              className="h-11 w-full rounded-lg border px-3 outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              name="description"
              rows={5}
              placeholder="Brand description..."
              className="w-full rounded-lg border px-3 py-3 outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-sky-600 px-6 py-3 font-medium text-white hover:bg-sky-700 disabled:opacity-50"
        >
          {loading
            ? "Creating..."
            : "Create Brand"}
        </button>
      </div>
    </form>
  );
}