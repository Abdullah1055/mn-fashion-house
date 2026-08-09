import { ProductCard } from "@/components/shop/product-card";

import { getCatalogProducts } from "@/lib/services/catalog.service";

export default async function ProductsPage() {
  const products =
    await getCatalogProducts();

  return (
    <main className="min-h-screen bg-neutral-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-sky-600">
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
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-white px-6 py-20 text-center">
            <h2 className="text-lg font-semibold text-neutral-900">
              No products available
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Please check back soon for our
              latest collection.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">
                  All Products
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  {products.length}{" "}
                  {products.length === 1
                    ? "product"
                    : "products"}
                </p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                )
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}