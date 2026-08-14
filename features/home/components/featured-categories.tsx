import { Section } from "@/components/common/section";

import { CategoryCard } from "./category-card";
import { FEATURED_CATEGORIES } from "../data/categories";

export function FeaturedCategories() {
  return (
    <Section className="!pt-1 !pb-1 sm:!pt-2 sm:!pb-2">
      {/* Section Header */}
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.40em] text-red-600">
          Categories
        </p>

        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Shop By Category
        </h2>

        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Explore our carefully selected collections and find
          the perfect style for every occasion.
        </p>
      </div>

      {/* Category Cards */}
      <div className="mt-2 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {FEATURED_CATEGORIES.map((category) => (
          <CategoryCard
            key={category.id}
            title={category.title}
            description={category.description}
            image={category.image}
          />
        ))}
      </div>
    </Section>
  );
}