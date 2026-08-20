import { ProductCatalog } from "@/components/shop/product-catalog";

import { getCatalogProducts } from "@/lib/services/catalog.service";

type ProductsPageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
  }>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const search =
    params.search?.trim() || "";

  const category =
    params.category?.trim() || "";

  const products =
    await getCatalogProducts();

  const normalizedSearch =
    search.toLowerCase();

  const normalizedCategory =
    category.toLowerCase();

  const filteredProducts =
    products.filter((product) => {
      const matchesCategory =
        !normalizedCategory ||
        product.category_name?.toLowerCase() ===
          normalizedCategory;

      const searchableText = [
        product.name,
        product.short_description,
        product.category_name,
        product.brand_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(
          normalizedSearch
        );

      return (
        matchesCategory &&
        matchesSearch
      );
    });

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* =====================================================
          SHOP CONTENT
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        {/* ===================================================
            FILTER / SEARCH RESULT INFO
        ==================================================== */}

        {(search || category) && (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
            <span>
              Showing results
              {category && (
                <>
                  {" "}
                  for{" "}
                  <strong className="text-neutral-900">
                    {category}
                  </strong>
                </>
              )}

              {search && (
                <>
                  {" "}
                  matching{" "}
                  <strong className="text-neutral-900">
                    "{search}"
                  </strong>
                </>
              )}
            </span>

            <a
              href="/products"
              className="font-semibold text-red-600 transition hover:text-red-700"
            >
              Clear filters
            </a>
          </div>
        )}

        {/* ===================================================
            PRODUCTS / SEARCH / FILTERS
        ==================================================== */}

        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-white px-6 py-20 text-center">
            <h2 className="text-lg font-semibold text-neutral-900">
              No products found
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Try another search term or
              select a different category.
            </p>

            <a
              href="/products"
              className="mt-6 inline-flex rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              View All Products
            </a>
          </div>
        ) : (
          <ProductCatalog
            products={filteredProducts}
          />
        )}
      </section>
    </main>
  );
}