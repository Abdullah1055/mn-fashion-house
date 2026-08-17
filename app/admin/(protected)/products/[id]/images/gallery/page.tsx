import { notFound } from "next/navigation";

import { getProductById } from "@/lib/services/product.service";
import { getProductImages } from "@/lib/services/product-image.service";

import { ProductImageManager } from "@/components/product/product-image-manager";

export default async function ProductImageGalleryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, images] =
    await Promise.all([
      getProductById(id),
      getProductImages(id),
    ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div>
        <h1 className="text-3xl font-extrabold text-neutral-950">
          Product Images
        </h1>

        <p className="mt-1 text-sm text-neutral-500">
          Manage images for{" "}
          <span className="font-semibold text-neutral-900">
            {product.name}
          </span>
        </p>
      </div>

      {/* Image Management */}

      <ProductImageManager
        productId={product.id}
        images={images}
      />
    </div>
  );
}