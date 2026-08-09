import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { getProductById } from "@/lib/services/product.service";
import { getProductImages } from "@/lib/services/product-image.service";

import { ProductImageGallery } from "@/components/product/product-image-gallery";

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
    <div className="space-y-8">
      <div>
        <Link
          href={`/admin/products/${product.id}/images`}
          className="inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-neutral-900"
        >
          <ArrowLeft size={16} />
          Back to Product Images
        </Link>

        <h1 className="mt-4 text-3xl font-bold">
          Product Gallery
        </h1>

        <p className="mt-2 text-neutral-500">
          Gallery for{" "}
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