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
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
              MN Fashion House
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">
              Shop Our Collection
            </h1>

            <p className="mt-4 text-base leading-7 text-neutral-600">
              Discover our latest fashion
              collection, carefully selected
              for quality, comfort and style.
            </p>

            {(search || category) && (
              <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
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
                  className="font-semibold text-red-600 hover:text-red-700"
                >
                  Clear filters
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
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