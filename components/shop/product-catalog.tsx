"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import type { CatalogProduct } from "@/lib/services/catalog.service";
import { ProductCard } from "@/components/shop/product-card";

type ProductCatalogProps = {
  products: CatalogProduct[];
};

export function ProductCatalog({
  products,
}: ProductCatalogProps) {
  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("all");

  const [brand, setBrand] =
    useState("all");

  const [sort, setSort] =
    useState("featured");

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map(
            (product) =>
              product.category_name
          )
          .filter(
            (
              value
            ): value is string =>
              Boolean(value)
          )
      )
    ).sort();
  }, [products]);

  const brands = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map(
            (product) =>
              product.brand_name
          )
          .filter(
            (
              value
            ): value is string =>
              Boolean(value)
          )
      )
    ).sort();
  }, [products]);

  const filteredProducts =
    useMemo(() => {
      const searchTerm =
        search
          .trim()
          .toLowerCase();

      const result =
        products.filter(
          (product) => {
            const matchesSearch =
              !searchTerm ||
              product.name
                .toLowerCase()
                .includes(
                  searchTerm
                ) ||
              product.short_description
                ?.toLowerCase()
                .includes(
                  searchTerm
                ) ||
              product.category_name
                ?.toLowerCase()
                .includes(
                  searchTerm
                ) ||
              product.brand_name
                ?.toLowerCase()
                .includes(
                  searchTerm
                );

            const matchesCategory =
              category === "all" ||
              product.category_name ===
                category;

            const matchesBrand =
              brand === "all" ||
              product.brand_name ===
                brand;

            return (
              matchesSearch &&
              matchesCategory &&
              matchesBrand
            );
          }
        );

      return [...result].sort(
        (a, b) => {
          switch (sort) {
            case "price-low":
              return (
                getSellingPrice(a) -
                getSellingPrice(b)
              );

            case "price-high":
              return (
                getSellingPrice(b) -
                getSellingPrice(a)
              );

            case "name-az":
              return a.name.localeCompare(
                b.name
              );

            case "name-za":
              return b.name.localeCompare(
                a.name
              );

            case "featured":
            default:
              if (
                a.is_featured !==
                b.is_featured
              ) {
                return a.is_featured
                  ? -1
                  : 1;
              }

              return a.name.localeCompare(
                b.name
              );
          }
        }
      );
    }, [
      products,
      search,
      category,
      brand,
      sort,
    ]);

  const hasFilters =
    search.trim() !== "" ||
    category !== "all" ||
    brand !== "all" ||
    sort !== "featured";

  function clearFilters() {
    setSearch("");
    setCategory("all");
    setBrand("all");
    setSort("featured");
  }

  return (
    <div>
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search products..."
              className="h-11 w-full rounded-lg border pl-10 pr-4 text-sm outline-none transition focus:border-black"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
              className="h-11 rounded-lg border bg-white px-3 text-sm outline-none transition focus:border-black"
            >
              <option value="all">
                All Categories
              </option>

              {categories.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>

            <select
              value={brand}
              onChange={(event) =>
                setBrand(
                  event.target.value
                )
              }
              className="h-11 rounded-lg border bg-white px-3 text-sm outline-none transition focus:border-black"
            >
              <option value="all">
                All Brands
              </option>

              {brands.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>

            <select
              value={sort}
              onChange={(event) =>
                setSort(
                  event.target.value
                )
              }
              className="h-11 rounded-lg border bg-white px-3 text-sm outline-none transition focus:border-black"
            >
              <option value="featured">
                Featured
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>

              <option value="name-az">
                Name: A–Z
              </option>

              <option value="name-za">
                Name: Z–A
              </option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <SlidersHorizontal size={15} />

            <span>
              Showing{" "}
              <span className="font-medium text-neutral-900">
                {filteredProducts.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-neutral-900">
                {products.length}
              </span>{" "}
              products
            </span>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 transition hover:text-black"
            >
              <X size={15} />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {filteredProducts.length ===
      0 ? (
        <div className="mt-6 rounded-2xl border border-dashed bg-white px-6 py-20 text-center">
          <h2 className="text-lg font-semibold text-neutral-900">
            No products found
          </h2>

          <p className="mt-2 text-sm text-neutral-500">
            Try changing your search
            or filters.
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map(
            (product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

function getSellingPrice(
  product: CatalogProduct
) {
  return Number(
    product.sale_price ??
      product.regular_price
  );
}