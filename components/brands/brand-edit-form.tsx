"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Brand } from "@/types/brand";

import { updateBrand } from "@/lib/actions/brand";

type Props = {
  brand: Brand;
};

export function BrandEditForm({
  brand,
}: Props) {
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
        await updateBrand(
          brand.id,
          formData
        );

      if (!result.success) {
        setError(
          result.error ||
            "Unable to update brand."
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
              defaultValue={brand.name}
              className="h-11 w-full rounded-lg border px-3 outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Logo URL
            </label>

            <input
              name="logo_url"
              defaultValue={
                brand.logo_url || ""
              }
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
              defaultValue={
                brand.description || ""
              }
              className="w-full rounded-lg border px-3 py-3 outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Status
            </label>

            <select
              name="is_active"
              defaultValue={
                brand.is_active
                  ? "true"
                  : "false"
              }
              className="h-11 w-full rounded-lg border px-3"
            >
              <option value="true">
                Active
              </option>

              <option value="false">
                Inactive
              </option>
            </select>
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
            ? "Saving..."
            : "Save Changes"}
        </button>
      </div>
    </form>
  );
}