import { notFound } from "next/navigation";

import { ProductForm } from "@/components/product/product-form";

import { getProductById } from "@/lib/services/product.service";
import { getActiveCategories } from "@/lib/services/category.service";
import { getBrands } from "@/lib/services/brand.service";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories, brands] =
    await Promise.all([
      getProductById(id),
      getActiveCategories(),
      getBrands(),
    ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Edit Product
        </h1>

        <p className="mt-2 text-neutral-500">
          Update product information and
          inventory settings.
        </p>
      </div>

      <ProductForm
        categories={categories}
        brands={brands}
        product={product}
      />
    </div>
  );
}