import Link from "next/link";
import {
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

type ProductCardProps = {
  name: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  regularPrice: number;
  salePrice?: number | null;
  offerPercentage?: number;
  stockQuantity?: number;
  brandName?: string | null;
};

export function ProductCard({
  name,
  slug,
  description,
  imageUrl,
  regularPrice,
  salePrice,
  offerPercentage = 0,
  stockQuantity = 0,
  brandName,
}: ProductCardProps) {
  const currentPrice =
    salePrice !== null &&
    salePrice !== undefined
      ? Number(salePrice)
      : Number(regularPrice);

  const discount =
    Number(offerPercentage) > 0
      ? Number(offerPercentage)
      : 0;

  const offerPrice =
    discount > 0
      ? currentPrice -
        (currentPrice * discount) / 100
      : currentPrice;

  const hasOffer = discount > 0;

  const hasSalePrice =
    salePrice !== null &&
    salePrice !== undefined &&
    currentPrice <
      Number(regularPrice);

  const isOutOfStock =
    Number(stockQuantity) <= 0;

  const productHref = slug
    ? `/shop/${slug}`
    : "#";

  return (
    <article className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Product Image */}

      <Link
        href={productHref}
        className="relative block aspect-[4/5] overflow-hidden bg-neutral-100"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
            No Image
          </div>
        )}

        {/* Offer Badge */}

        {hasOffer && (
          <span className="absolute right-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
            {discount}% OFF
          </span>
        )}

        {/* Sale Badge */}

        {!hasOffer &&
          hasSalePrice && (
            <span className="absolute right-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
              SALE
            </span>
          )}

        {/* Out of Stock */}

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Product Information */}

      <div className="p-4">
        {brandName && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
            {brandName}
          </p>
        )}

        <Link href={productHref}>
          <h3 className="mt-1 line-clamp-1 text-sm font-bold text-neutral-900 transition hover:text-red-600">
            {name}
          </h3>
        </Link>

        {description && (
          <p className="mt-1 line-clamp-2 min-h-[32px] text-xs leading-4 text-neutral-500">
            {description}
          </p>
        )}

        {/* Price */}

        <div className="mt-3 min-h-[24px]">
          {hasOffer ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-bold text-red-600">
                ৳{offerPrice.toFixed(0)}
              </span>

              <span className="text-xs text-neutral-400 line-through">
                ৳{currentPrice.toFixed(0)}
              </span>
            </div>
          ) : hasSalePrice ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-bold text-neutral-950">
                ৳{currentPrice.toFixed(0)}
              </span>

              <span className="text-xs text-neutral-400 line-through">
                ৳{Number(
                  regularPrice
                ).toFixed(0)}
              </span>
            </div>
          ) : (
            <span className="text-base font-bold text-neutral-950">
              ৳{Number(
                regularPrice
              ).toFixed(0)}
            </span>
          )}
        </div>

        {/* Actions */}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isOutOfStock}
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-neutral-950 px-2 py-2.5 text-[10px] font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 sm:text-[11px]"
          >
            <ShoppingBag size={14} />

            Add to Cart
          </button>

          <Link
            href={`${productHref}?action=order`}
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-red-600 px-2 py-2.5 text-[10px] font-semibold text-white transition hover:bg-red-700 sm:text-[11px]"
          >
            Order Now

            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}