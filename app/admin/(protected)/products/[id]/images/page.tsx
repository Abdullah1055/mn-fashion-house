import { notFound } from "next/navigation";

import { ProductImageManager } from "@/components/product/product-image-manager";

import { getProductById } from "@/lib/services/product.service";

export default async function ProductImagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Product Images
        </h1>

        <p className="mt-2 text-neutral-500">
          Manage images for{" "}
          <span className="font-medium text-neutral-900">
            {product.name}
          </span>
        </p>
      </div>

      <ProductImageManager
        productId={product.id}
      />
    </div>
  );
}