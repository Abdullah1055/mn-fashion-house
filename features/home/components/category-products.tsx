"use client";

import { useMemo, useState } from "react";

import type { StoreCategory } from "@/lib/services/category.service";
import type { CatalogProduct } from "@/lib/services/catalog.service";

import { ProductCard } from "@/components/shop/product-card";

type CategoryProductsProps = {
  categories: StoreCategory[];
  products: CatalogProduct[];
};

export function CategoryProducts({
  categories,
  products,
}: CategoryProductsProps) {
  const [selectedCategoryId, setSelectedCategoryId] =
    useState("all");

  const filteredProducts = useMemo(() => {
    if (selectedCategoryId === "all") {
      return products;
    }

    return products.filter(
      (product) =>
        product.category_id ===
        selectedCategoryId
    );
  }, [
    products,
    selectedCategoryId,
  ]);

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

        {/* =====================================================
            CATEGORY MENU
        ====================================================== */}

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {/* All Categories */}

          <button
            type="button"
            onClick={() =>
              setSelectedCategoryId("all")
            }
            className={`shrink-0 rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
              selectedCategoryId === "all"
                ? "bg-neutral-950 text-white shadow-sm"
                : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
            }`}
          >
            All Categories
          </button>

          {/* Dynamic Categories */}

          {categories.map((category) => {
            const isActive =
              selectedCategoryId ===
              category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  setSelectedCategoryId(
                    category.id
                  )
                }
                className={`shrink-0 rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-neutral-950 text-white shadow-sm"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>

        {/* =====================================================
            PRODUCT AREA
        ====================================================== */}

        <div className="mt-5">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredProducts.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                )
              )}
            </div>
          ) : (
            <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50">
              <div className="text-center">
                <h3 className="font-semibold text-neutral-900">
                  No Products Found
                </h3>

                <p className="mt-1 text-sm text-neutral-500">
                  There are no products in
                  this category yet.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}