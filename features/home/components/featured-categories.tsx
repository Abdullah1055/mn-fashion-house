import { Section } from "@/components/common/section";

import { CategoryCard } from "./category-card";
import { FEATURED_CATEGORIES } from "../data/categories";

export function FeaturedCategories() {
  return (
    <Section>
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">
          Categories
        </p>

        <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          Shop By Category
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-500">
          Explore our carefully selected collections
          and find the perfect style for every occasion.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
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