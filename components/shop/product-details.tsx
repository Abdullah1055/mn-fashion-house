"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  ShoppingBag,
  Zap,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useMemo,
  useState,
} from "react";

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
   SELECTED SIZE
========================================================= */

type SelectedSize = {
  size: string;
  variant: ProductVariant | null;
  quantity: number;
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

  const sortedImages = useMemo(
    () =>
      [...product.images].sort(
        (a, b) => {
          if (
            a.is_primary !==
            b.is_primary
          ) {
            return a.is_primary
              ? -1
              : 1;
          }

          return (
            a.sort_order -
            b.sort_order
          );
        }
      ),
    [product.images]
  );

  /* =========================================================
     ACTIVE VARIANTS
  ========================================================= */

  const activeVariants = useMemo(
    () =>
      product.variants.filter(
        (variant) =>
          variant.is_active
      ),
    [product.variants]
  );

  /* =========================================================
     UNIQUE SIZES
  ========================================================= */

  const sizes = useMemo(
    () =>
      Array.from(
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
      ),
    [activeVariants]
  );

  /* =========================================================
     UNIQUE COLORS
  ========================================================= */

  const colors = useMemo(
    () =>
      Array.from(
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
      ),
    [activeVariants]
  );

  /* =========================================================
     FIRST AVAILABLE SIZE
  ========================================================= */

  const firstAvailableSize =
    sizes.find((size) =>
      activeVariants.some(
        (variant) =>
          variant.size ===
            size &&
          Number(
            variant.stock_quantity
          ) > 0 &&
          (
            !colors.length ||
            variant.color ===
              (
                colors.find(
                  (color) =>
                    activeVariants.some(
                      (item) =>
                        item.color ===
                          color &&
                        Number(
                          item.stock_quantity
                        ) > 0
                    )
                ) ?? null
              )
          )
      )
    ) ?? null;

  /* =========================================================
     FIRST AVAILABLE COLOR
  ========================================================= */

  const firstAvailableColor =
    colors.find((color) =>
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
    sortedImages[0]
      ?.image_url ?? null
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

  /*
   * Stores every selected size
   * independently.
   *
   * Example:
   *
   * S -> 2
   * M -> 1
   * L -> 3
   *
   * Changing the size never changes
   * another size's quantity.
   */
  const [
    selectedSizes,
    setSelectedSizes,
  ] = useState<
    Record<string, SelectedSize>
  >({});

  /*
   * Quantity displayed in the
   * quantity controller belongs
   * ONLY to the currently selected size.
   */
  const [
    quantity,
    setQuantity,
  ] = useState(1);

  /* =========================================================
     EXACT SELECTED VARIANT
  ========================================================= */

  const selectedVariant =
    useMemo(() => {
      if (
        activeVariants.length ===
        0
      ) {
        return null;
      }

      return (
        activeVariants.find(
          (variant) => {
            const sizeMatches =
              sizes.length === 0
                ? !variant.size
                : variant.size ===
                  selectedSize;

            const colorMatches =
              colors.length === 0
                ? !variant.color
                : variant.color ===
                  selectedColor;

            return (
              sizeMatches &&
              colorMatches
            );
          }
        ) ?? null
      );
    }, [
      activeVariants,
      sizes.length,
      colors.length,
      selectedSize,
      selectedColor,
    ]);

  /* =========================================================
     CURRENT PRICE
  ========================================================= */

  const currentPrice =
    selectedVariant
      ?.sale_price ??
    selectedVariant
      ?.regular_price ??
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
     OPTIONS REQUIRED
  ========================================================= */

  const requiresSize =
    sizes.length > 0;

  const requiresColor =
    colors.length > 0;

  /* =========================================================
     GET VARIANT FOR SIZE
  ========================================================= */

  function getVariantForSize(
    size: string
  ) {
    return (
      activeVariants.find(
        (variant) => {
          const sizeMatches =
            variant.size ===
            size;

          const colorMatches =
            colors.length === 0
              ? !variant.color
              : variant.color ===
                selectedColor;

          return (
            sizeMatches &&
            colorMatches
          );
        }
      ) ?? null
    );
  }

  /* =========================================================
     SIZE STOCK
     
     ONLY checks availability.
     NEVER changes quantity.
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

          if (
            selectedColor
          ) {
            return (
              variant.color ===
              selectedColor
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
     
     ONLY checks availability.
     NEVER changes quantity.
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

          if (
            selectedSize
          ) {
            return (
              variant.size ===
              selectedSize
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
     SELECTED SIZE LIST
  ========================================================= */

  const selectedSizeList =
    useMemo(
      () =>
        Object.values(
          selectedSizes
        ).sort((a, b) => {
          const aIndex =
            sizes.indexOf(
              a.size
            );

          const bIndex =
            sizes.indexOf(
              b.size
            );

          return (
            aIndex - bIndex
          );
        }),
      [selectedSizes, sizes]
    );

  /* =========================================================
     TOTAL SELECTED QUANTITY
     
     Useful for displaying how many
     products are going to be ordered.
  ========================================================= */

  const totalSelectedQuantity =
    useMemo(
      () =>
        selectedSizeList.reduce(
          (total, item) =>
            total +
            item.quantity,
          0
        ),
      [selectedSizeList]
    );

  /* =========================================================
     CAN PURCHASE
  ========================================================= */

  const hasSelectedSizes =
    requiresSize
      ? selectedSizeList.length >
        0
      : true;

  const canPurchase =
    currentStock > 0 &&
    (!requiresSize ||
      selectedSize !== null) &&
    (!requiresColor ||
      selectedColor !== null) &&
    quantity >= 1 &&
    quantity <= currentStock &&
    hasSelectedSizes;

  /* =========================================================
     ADD SELECTED ITEMS TO CART
     
     Every selected size becomes
     a separate cart item.
  ========================================================= */

  function addSelectedItemsToCart() {
    /*
     * Product without variants.
     */
    if (
      activeVariants.length ===
      0
    ) {
      addToCart({
        productId:
          product.id,

        productName:
          product.name,

        productSlug:
          product.slug,

        variantId:
          null,

        variant:
          null,

        imageUrl:
          selectedImage,

        size:
          null,

        color:
          null,

        price:
          Number(
            currentPrice
          ),

        quantity,
      });

      return;
    }

    /*
     * Add every selected size
     * independently.
     */
    selectedSizeList.forEach(
      (selected) => {
        const variant =
          selected.variant ??
          getVariantForSize(
            selected.size
          );

        if (!variant) {
          return;
        }

        const price =
          variant.sale_price ??
          variant.regular_price ??
          product.sale_price ??
          product.regular_price;

        addToCart({
          productId:
            product.id,

          productName:
            product.name,

          productSlug:
            product.slug,

          variantId:
            variant.id,

          variant,

          imageUrl:
            selectedImage,

          size:
            variant.size ??
            selected.size,

          color:
            variant.color ??
            selectedColor,

          price:
            Number(price),

          quantity:
            selected.quantity,
        });
      }
    );
  }

  /* =========================================================
     ADD TO CART
  ========================================================= */

  function handleAddToCart() {
    if (!canPurchase) {
      return;
    }

    addSelectedItemsToCart();
  }

  /* =========================================================
     ORDER NOW
  ========================================================= */

  function handleOrderNow() {
    if (!canPurchase) {
      return;
    }

    addSelectedItemsToCart();

    router.push(
      "/checkout"
    );
  }

  /* =========================================================
     SELECT SIZE
     
     IMPORTANT:
     Clicking a size NEVER increases
     quantity.
     
     If the size was selected before,
     its previous quantity is restored.
     
     If it is a new size,
     quantity starts at 1.
  ========================================================= */

  function handleSelectSize(
    size: string
  ) {
    const stock =
      getSizeStock(size);

    if (stock <= 0) {
      return;
    }

    const existing =
      selectedSizes[size];

    setSelectedSize(size);

    /*
     * Existing size:
     * restore its own quantity.
     *
     * New size:
     * start from quantity 1.
     */
    setQuantity(
      existing?.quantity ??
        1
    );

    /*
     * If this size is not yet
     * selected, add it with
     * quantity 1.
     */
    if (!existing) {
      const variant =
        getVariantForSize(
          size
        );

      setSelectedSizes(
        (current) => ({
          ...current,
          [size]: {
            size,
            variant,
            quantity: 1,
          },
        })
      );
    }
  }

  /* =========================================================
     SELECT COLOR
     
     Since the current requirement
     is multiple sizes under the
     same color, changing color
     starts a fresh selection.
  ========================================================= */

  function handleSelectColor(
    color: string
  ) {
    const stock =
      getColorStock(color);

    if (stock <= 0) {
      return;
    }

    setSelectedColor(color);

    /*
     * New color = fresh size selection.
     */
    setSelectedSizes({});

    setSelectedSize(
      null
    );

    setQuantity(1);
  }

  /* =========================================================
     UPDATE CURRENT SIZE QUANTITY
     
     ONLY this function changes
     the quantity of the selected size.
  ========================================================= */

  function updateCurrentQuantity(
    nextQuantity: number
  ) {
    if (
      !selectedSize
    ) {
      return;
    }

    const maxStock =
      getSizeStock(
        selectedSize
      );

    const safeQuantity =
      Math.max(
        1,
        Math.min(
          maxStock,
          nextQuantity
        )
      );

    setQuantity(
      safeQuantity
    );

    setSelectedSizes(
      (current) => {
        const existing =
          current[
            selectedSize
          ];

        if (!existing) {
          return current;
        }

        return {
          ...current,
          [selectedSize]: {
            ...existing,
            quantity:
              safeQuantity,
          },
        };
      }
    );
  }

  /* =========================================================
     DECREASE QUANTITY
  ========================================================= */

  function decreaseQuantity() {
    if (
      !selectedSize
    ) {
      return;
    }

    updateCurrentQuantity(
      quantity - 1
    );
  }

  /* =========================================================
     INCREASE QUANTITY
  ========================================================= */

  function increaseQuantity() {
    if (
      !selectedSize
    ) {
      return;
    }

    updateCurrentQuantity(
      quantity + 1
    );
  }

  /* =========================================================
     REMOVE SELECTED SIZE
  ========================================================= */

  function removeSelectedSize(
    size: string
  ) {
    setSelectedSizes(
      (current) => {
        const updated = {
          ...current,
        };

        delete updated[size];

        return updated;
      }
    );

    /*
     * If the removed size is
     * currently active, select
     * another remaining size.
     */
    if (
      selectedSize ===
      size
    ) {
      const remaining =
        selectedSizeList.filter(
          (item) =>
            item.size !==
            size
        );

      const next =
        remaining[0];

      if (next) {
        setSelectedSize(
          next.size
        );

        setQuantity(
          next.quantity
        );
      } else {
        /*
         * No sizes remain.
         *
         * Keep the first available
         * size ready for selection,
         * but DO NOT add it automatically.
         */
        setSelectedSize(
          null
        );

        setQuantity(1);
      }
    }
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
              PRODUCT IMAGE
          ==================================================== */}

          <div>
            <div className="relative mx-auto aspect-square w-full max-w-[390px] overflow-hidden rounded-xl bg-neutral-100">

              {selectedImage ? (
                <Image
                  src={
                    selectedImage
                  }
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
              <div className="mt-3 flex gap-2 overflow-x-auto">
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
                      className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-neutral-50 ${
                        selectedImage ===
                        image.image_url
                          ? "border-red-500"
                          : "border-neutral-200"
                      }`}
                    >
                      <Image
                        src={
                          image.image_url
                        }
                        alt={
                          image.alt_text ||
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

            {/* BRAND */}

            {product.brand_name && (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
                {
                  product.brand_name
                }
              </p>
            )}

            {/* PRODUCT NAME */}

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
              {product.name}
            </h1>

            {/* CATEGORY */}

            {product.category_name && (
              <p className="mt-1 text-sm text-neutral-500">
                {
                  product.category_name
                }
              </p>
            )}

            {/* =================================================
                PRICE
            ================================================== */}

            <div className="mt-5 flex items-center gap-3">
              <span className="text-2xl font-bold text-neutral-950">
                ৳
                {Number(
                  currentPrice
                ).toFixed(2)}
              </span>

              {selectedVariant &&
                selectedVariant.sale_price !==
                  null && (
                  <span className="text-sm text-neutral-400 line-through">
                    ৳
                    {Number(
                      selectedVariant.regular_price
                    ).toFixed(2)}
                  </span>
                )}

              {!selectedVariant &&
                product.sale_price !==
                  null && (
                  <span className="text-sm text-neutral-400 line-through">
                    ৳
                    {Number(
                      product.regular_price
                    ).toFixed(2)}
                  </span>
                )}
            </div>

            {/* =================================================
                SHORT DESCRIPTION
            ================================================== */}

            {product.short_description && (
              <p className="mt-4 text-sm leading-6 text-neutral-600">
                {
                  product.short_description
                }
              </p>
            )}

            <div className="my-6 border-t border-neutral-200" />

            {/* =================================================
                SIZE
            ================================================== */}

            {requiresSize && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-neutral-900">
                    Size
                  </h2>

                  {selectedSize && (
                    <span className="text-xs text-neutral-500">
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
                      const stock =
                        getSizeStock(
                          size
                        );

                      const outOfStock =
                        stock <= 0;

                      const selected =
                        selectedSize ===
                        size;

                      const alreadyAdded =
                        Boolean(
                          selectedSizes[
                            size
                          ]
                        );

                      return (
                        <button
                          key={
                            size
                          }
                          type="button"
                          disabled={
                            outOfStock
                          }
                          onClick={() =>
                            handleSelectSize(
                              size
                            )
                          }
                          className={`relative min-w-16 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                            selected
                              ? "border-red-600 bg-red-600 text-white"
                              : alreadyAdded
                                ? "border-red-300 bg-red-50 text-red-700"
                                : outOfStock
                                  ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                                  : "border-neutral-300 bg-white text-neutral-800 hover:border-red-500"
                          }`}
                        >
                          {size}

                          {alreadyAdded &&
                            !selected && (
                            <span className="ml-1 text-[9px] font-bold">
                              ✓
                            </span>
                          )}

                          {outOfStock && (
                            <span className="ml-1 text-[9px]">
                              Out
                            </span>
                          )}
                        </button>
                      );
                    }
                  )}
                </div>

                {/* =================================================
                    SELECTED SIZES
                ================================================== */}

                {selectedSizeList.length >
                  0 && (
                  <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Selected Sizes
                      </p>

                      <p className="text-xs font-medium text-neutral-500">
                        {totalSelectedQuantity}{" "}
                        item
                        {totalSelectedQuantity !==
                        1
                          ? "s"
                          : ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedSizeList.map(
                        (
                          item
                        ) => (
                          <div
                            key={
                              item.size
                            }
                            className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSize(
                                  item.size
                                );

                                setQuantity(
                                  item.quantity
                                );
                              }}
                              className="text-xs font-semibold text-neutral-800 hover:text-red-600"
                            >
                              {item.size}{" "}
                              ×{" "}
                              {
                                item.quantity
                              }
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                removeSelectedSize(
                                  item.size
                                )
                              }
                              className="flex h-5 w-5 items-center justify-center rounded-full text-neutral-400 transition hover:bg-red-100 hover:text-red-600"
                              aria-label={`Remove size ${item.size}`}
                            >
                              <X
                                size={
                                  13
                                }
                              />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =================================================
                COLOR
            ================================================== */}

            {requiresColor && (
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-neutral-900">
                    Color
                  </h2>

                  {selectedColor && (
                    <span className="text-xs text-neutral-500">
                      {
                        selectedColor
                      }
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {colors.map(
                    (color) => {
                      const stock =
                        getColorStock(
                          color
                        );

                      const outOfStock =
                        stock <= 0;

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
                            outOfStock
                          }
                          onClick={() =>
                            handleSelectColor(
                              color
                            )
                          }
                          className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                            selected
                              ? "border-red-600 bg-red-600 text-white"
                              : outOfStock
                                ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                                : "border-neutral-300 bg-white text-neutral-800 hover:border-red-500"
                          }`}
                        >
                          {color}

                          {outOfStock && (
                            <span className="ml-1 text-[9px]">
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
                <p className="text-sm font-medium text-emerald-600">
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

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-neutral-900">
                  Quantity
                </h2>

                {selectedSize && (
                  <span className="text-xs text-neutral-500">
                    For size{" "}
                    <span className="font-semibold text-neutral-800">
                      {
                        selectedSize
                      }
                    </span>
                  </span>
                )}
              </div>

              <div className="flex w-fit items-center overflow-hidden rounded-lg border border-neutral-300">

                {/* MINUS */}

                <button
                  type="button"
                  onClick={
                    decreaseQuantity
                  }
                  disabled={
                    quantity <=
                      1 ||
                    currentStock <=
                      0 ||
                    !selectedSize
                  }
                  className="flex h-11 w-11 items-center justify-center border-r border-neutral-300 text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-300"
                  aria-label="Decrease quantity"
                >
                  <Minus
                    size={16}
                  />
                </button>

                {/* VALUE */}

                <div className="flex h-11 w-12 items-center justify-center text-sm font-semibold text-neutral-900">
                  {quantity}
                </div>

                {/* PLUS */}

                <button
                  type="button"
                  onClick={
                    increaseQuantity
                  }
                  disabled={
                    quantity >=
                      currentStock ||
                    currentStock <=
                      0 ||
                    !selectedSize
                  }
                  className="flex h-11 w-11 items-center justify-center border-l border-neutral-300 text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-300"
                  aria-label="Increase quantity"
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

              {/* ADD TO CART */}

              <button
                type="button"
                disabled={
                  !canPurchase
                }
                onClick={
                  handleAddToCart
                }
                className="flex h-12 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                <ShoppingBag
                  size={18}
                />

                {currentStock <=
                0
                  ? "Out of Stock"
                  : !hasSelectedSizes &&
                      requiresSize
                    ? "Select Size"
                    : "Add to Cart"}
              </button>

              {/* ORDER NOW */}

              <button
                type="button"
                disabled={
                  !canPurchase
                }
                onClick={
                  handleOrderNow
                }
                className="flex h-12 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
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
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">

            <div className="border-b border-neutral-200 pb-4">
              <h2 className="text-xl font-bold text-neutral-950">
                Product Description
              </h2>

              <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                Product Details
              </p>
            </div>

            <div className="pt-5">
              <p className="whitespace-pre-line text-sm leading-7 text-neutral-600 sm:text-base">
                {
                  product.description
                }
              </p>
            </div>

          </div>
        )}

        {/* =====================================================
            YOU MAY ALSO LIKE
        ====================================================== */}

        {relatedProducts.length >
          0 && (
          <section className="mt-10">

            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">
                You May Also Like
              </p>

              <h2 className="mt-1 text-2xl font-bold text-neutral-950">
                Explore More Styles
              </h2>

              <div className="mt-2 h-0.5 w-12 bg-red-600" />
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
                      className="group overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
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
                            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 240px"
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

                      <div className="p-3">

                        <h3 className="line-clamp-2 text-sm font-semibold text-neutral-950">
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
                            Number(
                              item.regular_price
                            ) >
                              Number(
                                item.sale_price
                              ) && (
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

                        <div className="mt-3 text-xs font-medium text-red-600">
                          View Product →
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