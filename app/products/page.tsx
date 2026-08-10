import { ProductCatalog } from "@/components/shop/product-catalog";

import { getCatalogProducts } from "@/lib/services/catalog.service";

export default async function ProductsPage() {
  const products =
    await getCatalogProducts();

  return (
    <main className="min-h-screen bg-neutral-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
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
              Please check back soon for
              our latest collection.
            </p>
          </div>
        ) : (
          <ProductCatalog
            products={products}
          />
        )}
      </section>
    </main>
  );
}