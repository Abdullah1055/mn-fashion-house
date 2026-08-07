import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

import { getCategories } from "@/lib/services/category.service";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Categories
          </h1>

          <p className="mt-2 text-neutral-500">
            Total Categories: {categories.length}
          </p>
        </div>

        <Link
          href="/admin/categories/new"
          className="rounded-lg bg-sky-600 px-5 py-3 text-white hover:bg-sky-700"
        >
          + Add Category
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white">
        <table className="w-full">
          <thead className="bg-neutral-100">
            <tr>
              <th className="px-6 py-4 text-left">
                Name
              </th>

              <th className="px-6 py-4 text-left">
                Slug
              </th>

              <th className="px-6 py-4 text-left">
                Status
              </th>

              <th className="px-6 py-4 text-right">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {categories.map((category) => (
              <tr
                key={category.id}
                className="border-t"
              >
                <td className="px-6 py-4">
                  {category.name}
                </td>

                <td className="px-6 py-4">
                  {category.slug}
                </td>

                <td className="px-6 py-4">
                  {category.is_active ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
                      Inactive
                    </span>
                  )}
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/categories/${category.id}`}
                      className="rounded-lg border p-2 hover:bg-neutral-100"
                    >
                      <Pencil size={18} />
                    </Link>

                    <button
                      type="button"
                      className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}