"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useCart } from "@/components/cart/cart-provider";

import type { ProductVariant } from "@/types/product-variant";

/* =========================================================
   TYPES
========================================================= */

type ProductImage = {
  id: string;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
};

type RelatedProduct = {
  id: string;
  name: string;
  slug: string;
  regular_price: number;
  sale_price: number | null;
  image_url: string | null;
};

type ProductDetailsProps = {
  product: {
    id: string;
    name: string;
    slug: string;

    short_description: string | null;
    description: string | null;

    regular_price: number;
    sale_price: number | null;

    stock_quantity: number;

    category_name: string | null;
    brand_name: string | null;

    images: ProductImage[];
    variants: ProductVariant[];
  };

  relatedProducts?: RelatedProduct[];
};

/* =========================================================
   PRODUCT DETAILS
========================================================= */

export function ProductDetails({
  product,
  relatedProducts = [],
}: ProductDetailsProps) {
  const router = useRouter();

  const { addToCart } = useCart();

  /* =========================================================
     SORT IMAGES
  ========================================================= */

  const sortedImages = useMemo(() => {
    return [...product.images].sort(
      (a, b) => {
        if (
          a.is_primary !==
          b.is_primary
        ) {
          return a.is_primary ? -1 : 1;
        }

        return (
          a.sort_order -
          b.sort_order
        );
      }
    );
  }, [product.images]);

  /* =========================================================
     ACTIVE VARIANTS
  ========================================================= */

  const activeVariants = useMemo(() => {
    return product.variants.filter(
      (variant) =>
        variant.is_active
    );
  }, [product.variants]);

  /* =========================================================
     AVAILABLE SIZES
  ========================================================= */

  const sizes = useMemo(() => {
    return Array.from(
      new Set(
        activeVariants
          .map(
            (variant) =>
              variant.size
          )
          .filter(
            (
              size
            ): size is string =>
              Boolean(size)
          )
      )
    );
  }, [activeVariants]);

  /* =========================================================
     AVAILABLE COLORS
  ========================================================= */

  const colors = useMemo(() => {
    return Array.from(
      new Set(
        activeVariants
          .map(
            (variant) =>
              variant.color
          )
          .filter(
            (
              color
            ): color is string =>
              Boolean(color)
          )
      )
    );
  }, [activeVariants]);

  /* =========================================================
     FIRST AVAILABLE SIZE
  ========================================================= */

  const firstAvailableSize =
    sizes.find(
      (size) =>
        activeVariants.some(
          (variant) =>
            variant.size ===
              size &&
            Number(
              variant.stock_quantity
            ) > 0
        )
    ) ?? null;

  /* =========================================================
     FIRST AVAILABLE COLOR
  ========================================================= */

  const firstAvailableColor =
    colors.find(
      (color) =>
        activeVariants.some(
          (variant) =>
            variant.color ===
              color &&
            Number(
              variant.stock_quantity
            ) > 0
        )
    ) ?? null;

  /* =========================================================
     STATE
  ========================================================= */

  const [
    selectedImage,
    setSelectedImage,
  ] = useState<string | null>(
    sortedImages[0]?.image_url ??
      null
  );

  const [
    selectedSize,
    setSelectedSize,
  ] = useState<string | null>(
    firstAvailableSize
  );

  const [
    selectedColor,
    setSelectedColor,
  ] = useState<string | null>(
    firstAvailableColor
  );

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  /* =========================================================
     GET VARIANT FOR SELECTED OPTIONS
  ========================================================= */

  const selectedVariant =
    useMemo(() => {
      /*
       * First try exact size + color
       */

      if (
        selectedSize &&
        selectedColor
      ) {
        const exact =
          activeVariants.find(
            (variant) =>
              variant.size ===
                selectedSize &&
              variant.color ===
                selectedColor
          );

        if (exact) {
          return exact;
        }
      }

      /*
       * Size only
       */

      if (selectedSize) {
        const sizeVariant =
          activeVariants.find(
            (variant) =>
              variant.size ===
                selectedSize &&
              (!selectedColor ||
                variant.color ===
                  selectedColor ||
                variant.color ===
                  null)
          );

        if (sizeVariant) {
          return sizeVariant;
        }
      }

      /*
       * Color only
       */

      if (selectedColor) {
        const colorVariant =
          activeVariants.find(
            (variant) =>
              variant.color ===
                selectedColor &&
              (!selectedSize ||
                variant.size ===
                  selectedSize ||
                variant.size ===
                  null)
          );

        if (colorVariant) {
          return colorVariant;
        }
      }

      /*
       * Product-level fallback
       */

      return null;
    }, [
      activeVariants,
      selectedSize,
      selectedColor,
    ]);

  /* =========================================================
     CURRENT PRICE
  ========================================================= */

  const currentPrice =
    selectedVariant?.sale_price ??
    selectedVariant?.regular_price ??
    product.sale_price ??
    product.regular_price;

  /* =========================================================
     CURRENT STOCK
  ========================================================= */

  const currentStock =
    selectedVariant
      ? Number(
          selectedVariant.stock_quantity
        )
      : Number(
          product.stock_quantity
        );

  /* =========================================================
     SIZE STOCK
  ========================================================= */

  function getSizeStock(
    size: string
  ) {
    const matchingVariants =
      activeVariants.filter(
        (variant) => {
          if (
            variant.size !==
            size
          ) {
            return false;
          }

          /*
           * If a color has been selected,
           * use that color's stock.
           */

          if (selectedColor) {
            return (
              variant.color ===
                selectedColor ||
              variant.color ===
                null
            );
          }

          return true;
        }
      );

    return matchingVariants.reduce(
      (total, variant) =>
        total +
        Math.max(
          0,
          Number(
            variant.stock_quantity
          )
        ),
      0
    );
  }

  /* =========================================================
     COLOR STOCK
  ========================================================= */

  function getColorStock(
    color: string
  ) {
    const matchingVariants =
      activeVariants.filter(
        (variant) => {
          if (
            variant.color !==
            color
          ) {
            return false;
          }

          if (selectedSize) {
            return (
              variant.size ===
                selectedSize ||
              variant.size ===
                null
            );
          }

          return true;
        }
      );

    return matchingVariants.reduce(
      (total, variant) =>
        total +
        Math.max(
          0,
          Number(
            variant.stock_quantity
          )
        ),
      0
    );
  }

  /* =========================================================
     CHECK IF SIZE IS AVAILABLE
  ========================================================= */

  function isSizeAvailable(
    size: string
  ) {
    return (
      getSizeStock(size) > 0
    );
  }

  /* =========================================================
     CHECK IF COLOR IS AVAILABLE
  ========================================================= */

  function isColorAvailable(
    color: string
  ) {
    return (
      getColorStock(color) > 0
    );
  }

  /* =========================================================
     PURCHASE VALIDATION
  ========================================================= */

  const requiresSize =
    sizes.length > 0;

  const requiresColor =
    colors.length > 0;

  const canPurchase =
    currentStock > 0 &&
    (!requiresSize ||
      selectedSize !== null) &&
    (!requiresColor ||
      selectedColor !== null);

  /* =========================================================
     SELECT SIZE
  ========================================================= */

  function handleSelectSize(
    size: string
  ) {
    if (
      !isSizeAvailable(size)
    ) {
      return;
    }

    setSelectedSize(size);

    /*
     * Reset quantity when
     * changing size.
     */

    setQuantity(1);

    /*
     * If selected color does not
     * exist for this size, select
     * the first available color.
     */

    if (selectedColor) {
      const compatible =
        activeVariants.some(
          (variant) =>
            variant.size ===
              size &&
            (variant.color ===
              selectedColor ||
              variant.color ===
                null) &&
            Number(
              variant.stock_quantity
            ) > 0
        );

      if (!compatible) {
        const nextColor =
          colors.find(
            (color) =>
              activeVariants.some(
                (variant) =>
                  variant.size ===
                    size &&
                  variant.color ===
                    color &&
                  Number(
                    variant.stock_quantity
                  ) > 0
              )
          ) ?? null;

        setSelectedColor(
          nextColor
        );
      }
    }
  }

  /* =========================================================
     SELECT COLOR
  ========================================================= */

  function handleSelectColor(
    color: string
  ) {
    if (
      !isColorAvailable(color)
    ) {
      return;
    }

    setSelectedColor(color);

    setQuantity(1);

    /*
     * If selected size does not
     * exist for this color,
     * choose the first available size.
     */

    if (selectedSize) {
      const compatible =
        activeVariants.some(
          (variant) =>
            variant.color ===
              color &&
            (variant.size ===
              selectedSize ||
              variant.size ===
                null) &&
            Number(
              variant.stock_quantity
            ) > 0
        );

      if (!compatible) {
        const nextSize =
          sizes.find(
            (size) =>
              activeVariants.some(
                (variant) =>
                  variant.color ===
                    color &&
                  variant.size ===
                    size &&
                  Number(
                    variant.stock_quantity
                  ) > 0
              )
          ) ?? null;

        setSelectedSize(
          nextSize
        );
      }
    }
  }

  /* =========================================================
     QUANTITY
  ========================================================= */

  function decreaseQuantity() {
    setQuantity((value) =>
      Math.max(
        1,
        value - 1
      )
    );
  }

  function increaseQuantity() {
    setQuantity((value) =>
      Math.min(
        Math.max(
          0,
          currentStock
        ),
        value + 1
      )
    );
  }

  /* =========================================================
     CART ITEM
  ========================================================= */

  function getCartItem() {
    return {
      productId:
        product.id,

      productName:
        product.name,

      productSlug:
        product.slug,

      variantId:
        selectedVariant?.id ??
        null,

      variant:
        selectedVariant,

      imageUrl:
        selectedImage,

      size:
        selectedVariant?.size ??
        selectedSize,

      color:
        selectedVariant?.color ??
        selectedColor,

      price:
        Number(currentPrice),

      quantity,
    };
  }

  /* =========================================================
     ADD TO CART
  ========================================================= */

  function handleAddToCart() {
    if (!canPurchase) {
      return;
    }

    addToCart(
      getCartItem()
    );
  }

  /* =========================================================
     ORDER NOW
  ========================================================= */

  function handleOrderNow() {
    if (!canPurchase) {
      return;
    }

    addToCart(
      getCartItem()
    );

    router.push(
      "/checkout"
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

        {/* =====================================================
            MAIN PRODUCT CARD
        ====================================================== */}

        <div className="grid gap-7 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5 lg:grid-cols-[minmax(0,390px)_minmax(0,1fr)] lg:gap-8 lg:p-6">

          {/* ===================================================
              IMAGE AREA
          ==================================================== */}

          <div>
            <div className="relative mx-auto aspect-square w-full max-w-[390px] overflow-hidden rounded-xl bg-neutral-100">

              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={
                    product.name
                  }
                  fill
                  priority
                  className="object-contain p-3"
                  sizes="(max-width: 1024px) 90vw, 390px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                  No image available
                </div>
              )}

              {product.sale_price !==
                null && (
                <span className="absolute right-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                  Sale
                </span>
              )}
            </div>

            {/* =================================================
                THUMBNAILS
            ================================================== */}

            {sortedImages.length >
              1 && (
              <div className="mt-3 flex gap-2">
                {sortedImages.map(
                  (image) => (
                    <button
                      key={
                        image.id
                      }
                      type="button"
                      onClick={() =>
                        setSelectedImage(
                          image.image_url
                        )
                      }
                      className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 bg-neutral-50 transition ${
                        selectedImage ===
                        image.image_url
                          ? "border-red-500"
                          : "border-neutral-200 hover:border-neutral-400"
                      }`}
                    >
                      <Image
                        src={
                          image.image_url
                        }
                        alt={
                          image.alt_text ??
                          product.name
                        }
                        fill
                        className="object-contain p-1"
                        sizes="64px"
                      />
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* ===================================================
              PRODUCT INFORMATION
          ==================================================== */}

          <div className="flex flex-col">

            {/* Brand */}

            {product.brand_name && (
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">
                {
                  product.brand_name
                }
              </p>
            )}

            {/* Name */}

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
              {product.name}
            </h1>

            {/* Category */}

            {product.category_name && (
              <p className="mt-1 text-sm text-neutral-500">
                {
                  product.category_name
                }
              </p>
            )}

            {/* Price */}

            <div className="mt-5 flex items-center gap-3">
              <span className="text-2xl font-bold text-neutral-950">
                ৳
                {Number(
                  currentPrice
                ).toFixed(2)}
              </span>

              {product.sale_price !==
                null &&
                Number(
                  product.regular_price
                ) >
                  Number(
                    product.sale_price
                  ) && (
                  <span className="text-sm text-neutral-400 line-through">
                    ৳
                    {Number(
                      product.regular_price
                    ).toFixed(2)}
                  </span>
                )}
            </div>

            {/* Short Description */}

            {product.short_description && (
              <p className="mt-6 text-sm leading-7 text-neutral-600">
                {
                  product.short_description
                }
              </p>
            )}

            <div className="my-6 h-px bg-neutral-200" />

            {/* =================================================
                SIZE
            ================================================== */}

            {sizes.length >
              0 && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-neutral-900">
                    Size
                  </h2>

                  {selectedSize && (
                    <span className="text-xs text-neutral-400">
                      Selected:{" "}
                      {
                        selectedSize
                      }
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {sizes.map(
                    (size) => {
                      const available =
                        isSizeAvailable(
                          size
                        );

                      const selected =
                        selectedSize ===
                        size;

                      return (
                        <button
                          key={
                            size
                          }
                          type="button"
                          disabled={
                            !available
                          }
                          onClick={() =>
                            handleSelectSize(
                              size
                            )
                          }
                          className={`min-w-14 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                            selected
                              ? "border-red-600 bg-red-600 text-white"
                              : available
                                ? "border-neutral-300 bg-white text-neutral-800 hover:border-red-500"
                                : "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                          }`}
                        >
                          {size}

                          {!available && (
                            <span className="ml-1 text-[10px]">
                              Out
                            </span>
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* =================================================
                COLOR
            ================================================== */}

            {colors.length >
              0 && (
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-neutral-900">
                    Color
                  </h2>

                  {selectedColor && (
                    <span className="text-xs text-neutral-400">
                      {
                        selectedColor
                      }
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {colors.map(
                    (color) => {
                      const available =
                        isColorAvailable(
                          color
                        );

                      const selected =
                        selectedColor ===
                        color;

                      return (
                        <button
                          key={
                            color
                          }
                          type="button"
                          disabled={
                            !available
                          }
                          onClick={() =>
                            handleSelectColor(
                              color
                            )
                          }
                          className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                            selected
                              ? "border-red-600 bg-red-600 text-white"
                              : available
                                ? "border-neutral-300 bg-white text-neutral-800 hover:border-red-500"
                                : "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                          }`}
                        >
                          {
                            color
                          }

                          {!available && (
                            <span className="ml-1 text-[10px]">
                              Out
                            </span>
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* =================================================
                STOCK
            ================================================== */}

            <div className="mt-5">
              {currentStock >
              0 ? (
                <p className="text-sm font-medium text-green-600">
                  {currentStock}{" "}
                  available
                </p>
              ) : (
                <p className="text-sm font-medium text-red-600">
                  Out of stock
                </p>
              )}
            </div>

            {/* =================================================
                QUANTITY
            ================================================== */}

            <div className="mt-6">
              <h2 className="mb-3 text-sm font-semibold text-neutral-900">
                Quantity
              </h2>

              <div className="flex h-11 w-fit overflow-hidden rounded-lg border border-neutral-300">
                <button
                  type="button"
                  onClick={
                    decreaseQuantity
                  }
                  disabled={
                    quantity <=
                      1 ||
                    currentStock <=
                      0
                  }
                  className="flex w-11 items-center justify-center border-r border-neutral-300 text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-300"
                >
                  <Minus
                    size={16}
                  />
                </button>

                <div className="flex w-14 items-center justify-center text-sm font-semibold text-neutral-900">
                  {quantity}
                </div>

                <button
                  type="button"
                  onClick={
                    increaseQuantity
                  }
                  disabled={
                    quantity >=
                      currentStock ||
                    currentStock <=
                      0
                  }
                  className="flex w-11 items-center justify-center border-l border-neutral-300 text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-300"
                >
                  <Plus
                    size={16}
                  />
                </button>
              </div>
            </div>

            {/* =================================================
                ACTION BUTTONS
            ================================================== */}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">

              <button
                type="button"
                onClick={
                  handleAddToCart
                }
                disabled={
                  !canPurchase
                }
                className="flex h-12 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                <ShoppingBag
                  size={18}
                />

                {canPurchase
                  ? "Add to Cart"
                  : "Out of Stock"}
              </button>

              <button
                type="button"
                onClick={
                  handleOrderNow
                }
                disabled={
                  !canPurchase
                }
                className="flex h-12 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                <Zap
                  size={18}
                />

                Order Now
              </button>
            </div>
          </div>
        </div>

        {/* =====================================================
            PRODUCT DESCRIPTION
        ====================================================== */}

        {product.description && (
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-lg font-bold text-neutral-950">
              Product Description
            </h2>

            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400">
              Product Details
            </p>

            <div className="my-4 h-px bg-neutral-200" />

            <div className="whitespace-pre-line text-sm leading-7 text-neutral-600">
              {
                product.description
              }
            </div>
          </div>
        )}

        {/* =====================================================
            YOU MAY ALSO LIKE
        ====================================================== */}

        {relatedProducts.length >
          0 && (
          <section className="mt-12">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">
                You May Also Like
              </p>

              <h2 className="mt-1 text-2xl font-bold text-neutral-950">
                You May Also Like
              </h2>

              <div className="mt-2 h-1 w-12 rounded-full bg-red-600" />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map(
                (item) => {
                  const price =
                    item.sale_price ??
                    item.regular_price;

                  return (
                    <Link
                      key={
                        item.id
                      }
                      href={`/products/${item.slug}`}
                      className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="relative aspect-square overflow-hidden bg-neutral-100">
                        {item.image_url ? (
                          <Image
                            src={
                              item.image_url
                            }
                            alt={
                              item.name
                            }
                            fill
                            className="object-contain p-3 transition duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 250px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                            No image
                          </div>
                        )}

                        {item.sale_price !==
                          null && (
                          <span className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-1 text-[10px] font-semibold text-white">
                            Sale
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="line-clamp-1 text-sm font-semibold text-neutral-900">
                          {
                            item.name
                          }
                        </h3>

                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-sm font-bold text-neutral-950">
                            ৳
                            {Number(
                              price
                            ).toFixed(
                              2
                            )}
                          </span>

                          {item.sale_price !==
                            null &&
                            item.regular_price >
                              item.sale_price && (
                              <span className="text-xs text-neutral-400 line-through">
                                ৳
                                {Number(
                                  item.regular_price
                                ).toFixed(
                                  2
                                )}
                              </span>
                            )}
                        </div>
                      </div>
                    </Link>
                  );
                }
              )}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}