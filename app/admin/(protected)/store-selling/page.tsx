import { getProducts } from "@/lib/services/product.service";

import { StoreProductSelector } from "@/components/store-selling/store-product-selector";

export default async function StoreSellingPage() {
  const products = await getProducts();

  return (
    <div className="space-y-8">
      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold text-neutral-950">
          Store Selling
        </h1>

        <p className="mt-2 text-neutral-500">
          Create a quick sale for showroom customers.
        </p>
      </div>

      {/* Product Selection */}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-neutral-950">
            Select Product
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Search by product name, SKU, color, size or category.
          </p>
        </div>

        <StoreProductSelector
          products={products}
        />
      </section>
    </div>
  );
}