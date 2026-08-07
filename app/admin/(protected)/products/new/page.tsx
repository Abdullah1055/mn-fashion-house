import { ProductForm } from "@/components/product/product-form";

import { getActiveCategories } from "@/lib/services/category.service";

export default async function NewProductPage() {
  const categories =
    await getActiveCategories();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Add Product
      </h1>

      <ProductForm
        categories={categories}
      />
    </div>
  );
}