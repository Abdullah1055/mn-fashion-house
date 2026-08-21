import Link from "next/link";
import {
  Pencil,
  Trash2,
  FolderTree,
  Plus,
  Search,
} from "lucide-react";

import { getCategories } from "@/lib/services/category.service";

export default async function CategoriesPage() {
  const categories = await getCategories();

  /*
   * ---------------------------------------------------------
   * CATEGORY LOOKUP
   * ---------------------------------------------------------
   */

  const categoryMap = new Map(
    categories.map((category) => [
      category.id,
      category,
    ])
  );

  /*
   * ---------------------------------------------------------
   * ONLY CHILD CATEGORIES
   * ---------------------------------------------------------
   *
   * Main Categories are managed separately from:
   *
   * /admin/main-categories
   *
   * Therefore this page only displays categories
   * having a parent_id.
   */

  const childCategories = categories
    .filter(
      (category) =>
        category.parent_id !== null
    )
    .sort((a, b) => {
      const parentA =
        categoryMap.get(
          a.parent_id!
        )?.name ?? "";

      const parentB =
        categoryMap.get(
          b.parent_id!
        )?.name ?? "";

      const parentCompare =
        parentA.localeCompare(parentB);

      if (parentCompare !== 0) {
        return parentCompare;
      }

      return a.name.localeCompare(
        b.name
      );
    });

  /*
   * ---------------------------------------------------------
   * MAIN CATEGORIES
   * ---------------------------------------------------------
   *
   * Used for the search/filter dropdown.
   */

  const mainCategories = categories
    .filter(
      (category) =>
        category.parent_id === null
    )
    .sort((a, b) =>
      a.name.localeCompare(b.name)
    );

  return (
    <div className="space-y-7">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
              <FolderTree
                size={22}
                className="text-blue-600"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Categories
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage product categories under
                your main categories.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
              {childCategories.length}{" "}
              Categories
            </span>
          </div>
        </div>

        {/* ===================================================
            ADD CATEGORY
        ==================================================== */}

        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Category
        </Link>
      </div>

      {/* =====================================================
          SEARCH / FILTER
      ====================================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search Icon */}

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search category..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Main Category Filter */}

          <select
            defaultValue="all"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-56"
          >
            <option value="all">
              All Main Categories
            </option>

            {mainCategories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* =====================================================
          CATEGORY TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="w-16 px-6 py-4 text-left text-sm font-semibold text-slate-700">
                #
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Category
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
            {childCategories.length > 0 ? (
              childCategories.map(
                (category, index) => {
                  const parent =
                    categoryMap.get(
                      category.parent_id!
                    );

                  return (
                    <tr
                      key={category.id}
                      className="border-t border-slate-200 transition hover:bg-slate-50"
                    >
                      {/* Serial */}

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {index + 1}
                      </td>

                      {/* Category */}

                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {category.name}
                        </div>
                      </td>

                      {/* Main Category */}

                      <td className="px-6 py-4">
                        {parent ? (
                          <span className="inline-flex rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                            {parent.name}
                          </span>
                        ) : (
                          <span className="text-sm text-red-500">
                            Parent not found
                          </span>
                        )}
                      </td>

                      {/* Slug */}

                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-slate-600">
                          {category.slug}
                        </span>
                      </td>

                      {/* Status */}

                      <td className="px-6 py-4">
                        {category.is_active ? (
                          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {/* Edit */}

                          <Link
                            href={`/admin/categories/${category.id}`}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
                            title="Edit Category"
                            aria-label="Edit Category"
                          >
                            <Pencil size={17} />
                          </Link>

                          {/* Delete */}

                          <button
                            type="button"
                            className="rounded-lg border border-red-200 p-2 text-red-500 transition hover:bg-red-50"
                            title="Delete Category"
                            aria-label="Delete Category"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-16 text-center"
                >
                  <div className="flex flex-col items-center">
                    <FolderTree
                      size={40}
                      className="text-slate-300"
                    />

                    <h3 className="mt-4 text-lg font-semibold text-slate-800">
                      No Categories Found
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Create a category under
                      a main category.
                    </p>

                    <Link
                      href="/admin/categories/new"
                      className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      <Plus size={17} />
                      Add Category
                    </Link>
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