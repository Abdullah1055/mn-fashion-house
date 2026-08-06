import { Section } from "@/components/common/section";

import { CategoryCard } from "./category-card";
import { FEATURED_CATEGORIES } from "../data/categories";

export function FeaturedCategories() {
  return (
    <Section>

      <div className="text-center">

        <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
          Categories
        </p>

        <h2 className="mt-4 font-serif text-5xl font-bold">
          Shop By Category
        </h2>

      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">

        {FEATURED_CATEGORIES.map((category) => (
          <CategoryCard
            key={category.id}
            title={category.title}
            description={category.description}
          />
        ))}

      </div>

    </Section>
  );
}