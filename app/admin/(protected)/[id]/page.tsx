import { notFound } from "next/navigation";

import { ProductForm } from "@/components/product/product-form";

import { getActiveCategories } from "@/lib/services/category.service";
import { getBrands } from "@/lib/services/brand.service";
import { getProductById } from "@/lib/services/product.service";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const [categories, brands] = await Promise.all([
    getActiveCategories(),
    getBrands(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Edit Product
        </h1>

        <p className="mt-2 text-neutral-500">
          Update product information.
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