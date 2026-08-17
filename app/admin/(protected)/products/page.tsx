import Link from "next/link";

import { ProductTable } from "@/components/product/product-table";
import { getProductsPaginated } from "@/lib/services/product.service";

type ProductsPageProps = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
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

  const requestedPage =
    Number(params.page);

  const requestedLimit =
    Number(params.limit);

  const page =
    Number.isFinite(requestedPage) &&
    requestedPage > 0
      ? Math.floor(requestedPage)
      : 1;

  const limit =
    PAGE_SIZES.includes(
      requestedLimit
    )
      ? requestedLimit
      : 10;

  const {
    products,
    total,
    totalPages,
  } = await getProductsPaginated(
    page,
    limit
  );

  const currentPage =
    Math.min(
      page,
      totalPages
    );

  const startItem =
    total === 0
      ? 0
      : (currentPage - 1) * limit + 1;

  const endItem =
    Math.min(
      currentPage * limit,
      total
    );

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

    return `/admin/products?${query.toString()}`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Products
          </h1>

          <p className="mt-2 text-neutral-500">
            Total Products: {total}
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="rounded-lg bg-sky-600 px-5 py-3 text-white transition hover:bg-sky-700"
        >
          + Add Product
        </Link>
      </div>

      {/* Product Table */}

      <ProductTable
        products={products}
      />

      {/* Pagination */}

      <div className="flex flex-col gap-4 rounded-xl border bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Showing */}

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
          {/* Page Size */}

          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <span>Show</span>

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
                      limit === size
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

          {/* Page Navigation */}

          <div className="flex items-center gap-2">
            <Link
              href={createPageUrl(
                Math.max(
                  1,
                  currentPage - 1
                )
              )}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                currentPage <= 1
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
                  currentPage + 1
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