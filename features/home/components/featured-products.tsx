import { Section } from "@/components/common/section";

import { ProductCard } from "./product-card";
import { FEATURED_PRODUCTS } from "../data/products";

export function FeaturedProducts() {
  return (
    <Section>

      <div className="text-center">

        <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
          Featured
        </p>

        <h2 className="mt-4 font-serif text-5xl font-bold">
          Featured Products
        </h2>

      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">

        {FEATURED_PRODUCTS.map((product) => (
          <ProductCard
            key={product.id}
            name={product.name}
            price={product.price}
            badge={product.badge}
          />
        ))}

      </div>

    </Section>
  );
}