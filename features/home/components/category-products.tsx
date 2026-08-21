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
  const [selectedParentId, setSelectedParentId] =
    useState<string | null>(null);

  const [selectedChildId, setSelectedChildId] =
    useState<string | null>(null);

  /* =========================================================
     TOP LEVEL CATEGORIES
  ========================================================= */

  const parentCategories = useMemo(() => {
    return categories.filter(
      (category) =>
        category.parent_id === null
    );
  }, [categories]);

  /* =========================================================
     CHILD CATEGORIES
  ========================================================= */

  const childCategories = useMemo(() => {
    if (!selectedParentId) {
      return [];
    }

    return categories.filter(
      (category) =>
        category.parent_id ===
        selectedParentId
    );
  }, [
    categories,
    selectedParentId,
  ]);

  /* =========================================================
     PRODUCT FILTERING
  ========================================================= */

  const filteredProducts = useMemo(() => {
    // No parent selected
    if (!selectedParentId) {
      return products;
    }

    // Child category selected
    if (selectedChildId) {
      return products.filter(
        (product) =>
          product.category_id ===
          selectedChildId
      );
    }

    // Parent selected
    // Show products from all child categories
    const childIds =
      childCategories.map(
        (category) => category.id
      );

    // If parent has no child category,
    // allow products directly assigned to parent.
    if (childIds.length === 0) {
      return products.filter(
        (product) =>
          product.category_id ===
          selectedParentId
      );
    }

    return products.filter((product) => {
      return (
        product.category_id ===
          selectedParentId ||
        childIds.includes(
          product.category_id
        )
      );
    });
  }, [
    products,
    selectedParentId,
    selectedChildId,
    childCategories,
  ]);

  /* =========================================================
     PARENT CATEGORY SELECT
  ========================================================= */

  function handleParentSelect(
    categoryId: string | null
  ) {
    setSelectedParentId(categoryId);
    setSelectedChildId(null);
  }

  /* =========================================================
     CHILD CATEGORY SELECT
  ========================================================= */

  function handleChildSelect(
    categoryId: string | null
  ) {
    setSelectedChildId(categoryId);
  }

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

        {/* =====================================================
            TOP LEVEL CATEGORY MENU
        ====================================================== */}

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {/* All */}

          <button
            type="button"
            onClick={() =>
              handleParentSelect(null)
            }
            className={`shrink-0 rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
              selectedParentId === null
                ? "bg-neutral-950 text-white shadow-sm"
                : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
            }`}
          >
            All
          </button>

          {/* Parent Categories */}

          {parentCategories.map(
            (category) => {
              const isActive =
                selectedParentId ===
                category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    handleParentSelect(
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
            }
          )}
        </div>

        {/* =====================================================
            CHILD CATEGORY MENU
        ====================================================== */}

        {selectedParentId &&
          childCategories.length > 0 && (
            <div className="mt-3 flex items-center gap-2 overflow-x-auto border-t border-neutral-100 pt-3 scrollbar-hide">
              {/* All Child Categories */}

              <button
                type="button"
                onClick={() =>
                  handleChildSelect(null)
                }
                className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  selectedChildId === null
                    ? "bg-neutral-900 text-white"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                All
              </button>

              {childCategories.map(
                (category) => {
                  const isActive =
                    selectedChildId ===
                    category.id;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() =>
                        handleChildSelect(
                          category.id
                        )
                      }
                      className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-neutral-900 text-white"
                          : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      {category.name}
                    </button>
                  );
                }
              )}
            </div>
          )}

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