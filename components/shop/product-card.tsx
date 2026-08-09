import Link from "next/link";

import type { CatalogProduct } from "@/lib/services/catalog.service";

type ProductCardProps = {
  product: CatalogProduct;
};

export function ProductCard({
  product,
}: ProductCardProps) {
  const hasSale =
    product.sale_price !== null &&
    product.sale_price <
      product.regular_price;

  const isOutOfStock =
    product.stock_quantity <= 0;

  return (
    <article className="group overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <Link
        href={`/products/${product.slug}`}
        className="block"
      >
        <div className="relative aspect-square overflow-hidden bg-neutral-100">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-neutral-400">
              No image
            </div>
          )}

          {product.is_featured && (
            <span className="absolute left-3 top-3 rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white">
              Featured
            </span>
          )}

          {hasSale && (
            <span className="absolute right-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white">
              Sale
            </span>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-900">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2 p-5">
          {product.brand_name && (
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              {product.brand_name}
            </p>
          )}

          <h2 className="line-clamp-2 text-base font-semibold text-neutral-900">
            {product.name}
          </h2>

          {product.short_description && (
            <p className="line-clamp-2 text-sm text-neutral-500">
              {product.short_description}
            </p>
          )}

          <div className="flex items-center gap-2 pt-2">
            {hasSale ? (
              <>
                <span className="text-lg font-bold text-neutral-900">
                  ৳
                  {product.sale_price!.toFixed(
                    2
                  )}
                </span>

                <span className="text-sm text-neutral-400 line-through">
                  ৳
                  {product.regular_price.toFixed(
                    2
                  )}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-neutral-900">
                ৳
                {product.regular_price.toFixed(
                  2
                )}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}