import { getActiveCategories } from "@/lib/services/category.service";
import { getCatalogProducts } from "@/lib/services/catalog.service";

import { CategoryProducts } from "./category-products";

export async function FeaturedCategories() {
  const [categories, products] =
    await Promise.all([
      getActiveCategories(),
      getCatalogProducts(),
    ]);

  return (
    <CategoryProducts
      categories={categories}
      products={products}
    />
  );
}