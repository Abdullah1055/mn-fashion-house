import { getProducts } from "@/lib/services/product.service";
import { getProductOffers } from "@/lib/services/product-offer.service";

import { ProductOfferTable } from "@/components/product/product-offer-table";

export default async function OffersPage() {
  const [products, offers] =
    await Promise.all([
      getProducts(),
      getProductOffers(),
    ]);

  return (
    <div className="space-y-6">
      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold text-neutral-900">
          Offers
        </h1>

        <p className="mt-1 text-sm text-neutral-500">
          Manage product discounts and
          promotional prices.
        </p>
      </div>

      {/* Product Offer Table */}

      <ProductOfferTable
        products={products}
        offers={offers}
      />
    </div>
  );
}