import { notFound } from "next/navigation";

import { ProductVariantForm } from "@/components/product/product-variant-form";
import { ProductVariantList } from "@/components/product/product-variant-list";

import { getProductById } from "@/lib/services/product.service";
import { getProductVariants } from "@/lib/services/product-variant.service";

export default async function ProductVariantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, variants] =
    await Promise.all([
      getProductById(id),
      getProductVariants(id),
    ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Product Variants
        </h1>

        <p className="mt-2 text-neutral-500">
          Manage size, color, pricing and
          stock variants for{" "}
          <span className="font-medium text-neutral-900">
            {product.name}
          </span>
        </p>
      </div>

      <ProductVariantForm
        productId={product.id}
      />

      <ProductVariantList
        productId={product.id}
        variants={variants}
      />
    </div>
  );
}