import { getProducts } from "@/lib/services/product.service";

import { StoreProductSelector } from "@/components/store-selling/store-product-selector";

export default async function StoreSellingPage() {
  const products = await getProducts();

  return (
    <div className="space-y-1">
      {/* Header */}

      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Store Selling</h1>
      </div>

      {/* Product selector */}
      <StoreProductSelector products={products} />
    </div>
  );
}