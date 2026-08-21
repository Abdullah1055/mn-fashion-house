import Link from "next/link";

import { ProductTable } from "@/components/product/product-table";
import { getProductsPaginated } from "@/lib/services/product.service";
import {
  getCategories,
  getParentCategories,
} from "@/lib/services/category.service";

type ProductsPageProps = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    mainCategory?: string;
    category?: string;
  }>;
};

const PAGE_SIZES = [
  10,
  20,
  50,
];

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params =
    await searchParams;

  /* =======================================================
     PAGINATION
  ======================================================= */

  const requestedPage =
    Number(params.page);

  const requestedLimit =
    Number(params.limit);

  const page =
    Number.isFinite(
      requestedPage
    ) &&
    requestedPage > 0
      ? Math.floor(
          requestedPage
        )
      : 1;

  const limit =
    PAGE_SIZES.includes(
      requestedLimit
    )
      ? requestedLimit
      : 10;

  /* =======================================================
     FILTER VALUES
  ======================================================= */

  const search =
    params.search?.trim() ??
    "";

  const mainCategory =
    params.mainCategory ??
    "all";

  const category =
    params.category ??
    "all";

  /* =======================================================
     LOAD CATEGORIES
  ======================================================= */

  const [
    categories,
    mainCategories,
  ] = await Promise.all([
    getCategories(),
    getParentCategories(),
  ]);

  /* =======================================================
     CATEGORY OPTIONS
     
     When Main Category is selected,
     only its child categories are shown.
  ======================================================= */

  const filteredCategoryOptions =
    mainCategory === "all"
      ? categories.filter(
          (item) =>
            item.parent_id !==
            null
        )
      : categories.filter(
          (item) =>
            item.parent_id ===
            mainCategory
        );

  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

  const {
    products,
    total,
    totalPages,
  } =
    await getProductsPaginated(
      page,
      limit,
      search,
      mainCategory,
      category
    );

  /* =======================================================
     CURRENT PAGE
  ======================================================= */

  const currentPage =
    Math.min(
      page,
      totalPages
    );

  /* =======================================================
     RESULT RANGE
  ======================================================= */

  const startItem =
    total === 0
      ? 0
      : (currentPage - 1) *
          limit +
        1;

  const endItem =
    Math.min(
      currentPage * limit,
      total
    );

  /* =======================================================
     PAGE URL
     
     Preserve active filters when changing page.
  ======================================================= */

  function createPageUrl(
    targetPage: number,
    targetLimit: number = limit
  ) {
    const query =
      new URLSearchParams();

    query.set(
      "page",
      String(targetPage)
    );

    query.set(
      "limit",
      String(targetLimit)
    );

    if (search) {
      query.set(
        "search",
        search
      );
    }

    if (
      mainCategory !==
      "all"
    ) {
      query.set(
        "mainCategory",
        mainCategory
      );
    }

    if (
      category !== "all"
    ) {
      query.set(
        "category",
        category
      );
    }

    return `/admin/products?${query.toString()}`;
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Products
          </h1>

          <p className="mt-2 text-neutral-500">
            Total Products:{" "}
            {total}
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="rounded-lg bg-sky-600 px-5 py-3 text-white transition hover:bg-sky-700"
        >
          + Add Product
        </Link>
      </div>

      {/* =====================================================
          SEARCH + FILTER
      ====================================================== */}

      <form
        method="GET"
        className="rounded-xl border bg-white p-4 shadow-sm"
      >
        {/* Reset pagination whenever
            a new filter is submitted. */}

        <input
          type="hidden"
          name="page"
          value="1"
        />

        <input
          type="hidden"
          name="limit"
          value={limit}
        />

        <div className="grid gap-3 md:grid-cols-[1fr_220px_220px_auto]">
          {/* -------------------------------------------------
              SEARCH
          -------------------------------------------------- */}

          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search product, SKU, slug, category or brand..."
            className="h-11 rounded-lg border border-neutral-300 px-4 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />

          {/* -------------------------------------------------
              MAIN CATEGORY
          -------------------------------------------------- */}

          <select
            name="mainCategory"
            defaultValue={
              mainCategory
            }
            className="h-11 rounded-lg border border-neutral-300 px-4 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            <option value="all">
              All Main Categories
            </option>

            {mainCategories.map(
              (item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              )
            )}
          </select>

          {/* -------------------------------------------------
              CATEGORY
          -------------------------------------------------- */}

          <select
            name="category"
            defaultValue={
              filteredCategoryOptions.some(
                (item) =>
                  item.id ===
                  category
              )
                ? category
                : "all"
            }
            className="h-11 rounded-lg border border-neutral-300 px-4 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            <option value="all">
              All Categories
            </option>

            {filteredCategoryOptions.map(
              (item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              )
            )}
          </select>

          {/* -------------------------------------------------
              SEARCH BUTTON
          -------------------------------------------------- */}

          <button
            type="submit"
            className="h-11 rounded-lg bg-sky-600 px-5 text-sm font-medium text-white transition hover:bg-sky-700"
          >
            Search
          </button>
        </div>

        {/* -------------------------------------------------
            CLEAR FILTERS
        -------------------------------------------------- */}

        {(search ||
          mainCategory !==
            "all" ||
          category !==
            "all") && (
          <div className="mt-3">
            <Link
              href={`/admin/products?page=1&limit=${limit}`}
              className="text-sm font-medium text-sky-600 hover:text-sky-700"
            >
              Clear Filters
            </Link>
          </div>
        )}
      </form>

      {/* =====================================================
          PRODUCT TABLE
      ====================================================== */}

      <ProductTable
        products={products}
      />

      {/* =====================================================
          PAGINATION
      ====================================================== */}

      <div className="flex flex-col gap-4 rounded-xl border bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        {/* ---------------------------------------------------
            SHOWING
        ---------------------------------------------------- */}

        <p className="text-sm text-neutral-600">
          Showing{" "}
          <span className="font-medium text-neutral-900">
            {startItem}
          </span>{" "}
          to{" "}
          <span className="font-medium text-neutral-900">
            {endItem}
          </span>{" "}
          of{" "}
          <span className="font-medium text-neutral-900">
            {total}
          </span>{" "}
          products
        </p>

        <div className="flex flex-wrap items-center gap-4">
          {/* -------------------------------------------------
              PAGE SIZE
          -------------------------------------------------- */}

          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <span>
              Show
            </span>

            <div className="flex overflow-hidden rounded-lg border border-neutral-300">
              {PAGE_SIZES.map(
                (size) => (
                  <Link
                    key={size}
                    href={createPageUrl(
                      1,
                      size
                    )}
                    className={`px-3 py-2 text-sm font-medium transition ${
                      limit ===
                      size
                        ? "bg-sky-600 text-white"
                        : "bg-white text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    {size}
                  </Link>
                )
              )}
            </div>
          </div>

          {/* -------------------------------------------------
              PAGE NAVIGATION
          -------------------------------------------------- */}

          <div className="flex items-center gap-2">
            <Link
              href={createPageUrl(
                Math.max(
                  1,
                  currentPage -
                    1
                )
              )}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                currentPage <=
                1
                  ? "pointer-events-none text-neutral-300"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              Previous
            </Link>

            <span className="min-w-[90px] text-center text-sm text-neutral-600">
              Page{" "}
              <span className="font-semibold text-neutral-900">
                {currentPage}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-neutral-900">
                {totalPages}
              </span>
            </span>

            <Link
              href={createPageUrl(
                Math.min(
                  totalPages,
                  currentPage +
                    1
                )
              )}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                currentPage >=
                totalPages
                  ? "pointer-events-none text-neutral-300"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              Next
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}