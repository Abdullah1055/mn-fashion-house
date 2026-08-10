import Link from "next/link";

import { getCatalogProducts } from "@/lib/services/catalog.service";
import { ProductCard } from "@/components/shop/product-card";

import { Section } from "@/components/common/section";

export async function FeaturedProducts() {
  const products =
    await getCatalogProducts();

  const featuredProducts =
    products
      .filter(
        (product) =>
          product.is_featured
      )
      .slice(0, 4);

  const displayProducts =
    featuredProducts.length > 0
      ? featuredProducts
      : products.slice(0, 4);

  return (
    <Section className="bg-sky-50/50">
      <div className="flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:items-end sm:text-left">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">
            Featured
          </p>

          <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Featured Products
          </h2>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
            Discover our latest collection,
            selected for quality, comfort and
            everyday style.
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex shrink-0 items-center text-sm font-semibold text-red-600 transition hover:text-red-700"
        >
          View All Products
          <span className="ml-2">
            →
          </span>
        </Link>
      </div>

      {displayProducts.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed bg-white px-6 py-16 text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            Products Coming Soon
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Our latest collection will be
            available here soon.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayProducts.map(
            (product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            )
          )}
        </div>
      )}
    </Section>
  );
}