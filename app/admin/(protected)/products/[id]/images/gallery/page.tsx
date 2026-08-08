import { notFound } from "next/navigation";

import { ProductImageGallery } from "@/components/product/product-image-gallery";

import { getProductById } from "@/lib/services/product.service";
import { getProductImages } from "@/lib/services/product-image.service";

export default async function ProductImageGalleryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const images = await getProductImages(product.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Product Image Gallery
        </h1>

        <p className="mt-2 text-neutral-500">
          Manage images for{" "}
          <span className="font-medium text-neutral-900">
            {product.name}
          </span>
        </p>
      </div>

      <ProductImageGallery
        productId={product.id}
        images={images}
      />
    </div>
  );
}