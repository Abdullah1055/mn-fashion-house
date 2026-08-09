import { ProductForm } from "@/components/product/product-form";

import { getActiveCategories } from "@/lib/services/category.service";
import { getBrands } from "@/lib/services/brand.service";

export default async function NewProductPage() {
  const [
    categories,
    brands,
  ] = await Promise.all([
    getActiveCategories(),
    getBrands(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Add Product
        </h1>

        <p className="mt-2 text-neutral-500">
          Create a new product for your
          store.
        </p>
      </div>

      <ProductForm
        categories={categories}
        brands={brands}
      />
    </div>
  );
}