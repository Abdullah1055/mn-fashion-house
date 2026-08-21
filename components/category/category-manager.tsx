"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  parent_id: string | null;
};

type CategoryManagerProps = {
  categories: Category[];
  children?: React.ReactNode;
};

export function CategoryManager({
  categories,
  children,
}: CategoryManagerProps) {
  const [search, setSearch] = useState("");
  const [mainCategory, setMainCategory] =
    useState("all");

  /*
   * Main categories = categories without parent
   */
  const mainCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.parent_id === null
      ),
    [categories]
  );

  /*
   * Only child categories will be shown
   * on the Categories page.
   */
  const childCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.parent_id !== null
      ),
    [categories]
  );

  /*
   * Filter categories by:
   * 1. Category name
   * 2. Selected main category
   */
  const filteredCategories = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase();

    return childCategories.filter((category) => {
      const matchesSearch =
        searchValue === "" ||
        category.name
          .toLowerCase()
          .includes(searchValue) ||
        category.slug
          .toLowerCase()
          .includes(searchValue);

      const matchesMainCategory =
        mainCategory === "all" ||
        category.parent_id === mainCategory;

      return (
        matchesSearch &&
        matchesMainCategory
      );
    });
  }, [
    childCategories,
    search,
    mainCategory,
  ]);

  /*
   * Parent category lookup
   */
  const categoryMap = useMemo(
    () =>
      new Map(
        mainCategories.map((category) => [
          category.id,
          category,
        ])
      ),
    [mainCategories]
  );

  return (
    <>
      {/* =====================================================
          SEARCH + FILTER
      ====================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search category..."
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Main Category Filter */}
          <select
            value={mainCategory}
            onChange={(event) =>
              setMainCategory(event.target.value)
            }
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:w-56"
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
          RESULT COUNT
      ====================================================== */}

      <div className="text-sm text-slate-500">
        {filteredCategories.length}{" "}
        {filteredCategories.length === 1
          ? "Category"
          : "Categories"}
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
            {filteredCategories.length > 0 ? (
              filteredCategories.map(
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
                          <span className="rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                            {parent.name}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">
                            —
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
                          {children}
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
                    <Search
                      size={36}
                      className="text-slate-300"
                    />

                    <h3 className="mt-4 text-lg font-semibold text-slate-800">
                      No Categories Found
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Try a different search or
                      main category.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}