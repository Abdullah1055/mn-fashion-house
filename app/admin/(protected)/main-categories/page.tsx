import Link from "next/link";
import { Pencil, Trash2, FolderTree } from "lucide-react";

import { getParentCategories } from "@/lib/services/category.service";

export default async function MainCategoriesPage() {
  const categories = await getParentCategories();

  return (
    <div className="space-y-8">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <FolderTree className="h-6 w-6 text-blue-600" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Main Categories
            </h1>

            <p className="mt-1 text-sm text-neutral-500">
              Manage top-level product categories.
            </p>
          </div>
        </div>

        <Link
          href="/admin/main-categories/new"
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + Add Main Category
        </Link>
      </div>

      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <div>
        <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
          {categories.length} Main Categories
        </span>
      </div>

      {/* =====================================================
          CATEGORY TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                #
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Main Category
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Slug
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Status
              </th>

              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {categories.map((category, index) => (
              <tr
                key={category.id}
                className="border-t border-slate-200"
              >
                {/* Number */}
                <td className="px-6 py-5 text-sm text-slate-500">
                  {index + 1}
                </td>

                {/* Main Category */}
                <td className="px-6 py-5">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {category.name}
                    </p>

                    <p className="mt-1 text-xs text-blue-600">
                      Top Level Category
                    </p>
                  </div>
                </td>

                {/* Slug */}
                <td className="px-6 py-5 text-sm text-slate-600">
                  {category.slug}
                </td>

                {/* Status */}
                <td className="px-6 py-5">
                  {category.is_active ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                      Inactive
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-5">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/main-categories/${category.id}`}
                      className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
                      title="Edit"
                    >
                      <Pencil size={17} />
                    </Link>

                    <button
                      type="button"
                      className="rounded-lg border border-red-200 p-2 text-red-500 transition hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {/* Empty State */}
            {categories.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-16 text-center"
                >
                  <div className="flex flex-col items-center">
                    <FolderTree className="h-10 w-10 text-slate-300" />

                    <h3 className="mt-3 font-semibold text-slate-800">
                      No Main Categories
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Create your first main category.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}