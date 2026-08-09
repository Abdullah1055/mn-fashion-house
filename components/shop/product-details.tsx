"use client";

import Image from "next/image";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";

import { useCart } from "@/components/cart/cart-provider";

import type { ProductVariant } from "@/types/product-variant";

type ProductImage = {
  id: string;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
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
};

export function ProductDetails({
  product,
}: ProductDetailsProps) {
  const { addToCart } = useCart();

  const sortedImages = [
    ...product.images,
  ].sort((a, b) => {
    if (a.is_primary !== b.is_primary) {
      return a.is_primary ? -1 : 1;
    }

    return a.sort_order - b.sort_order;
  });

  const activeVariants =
    product.variants.filter(
      (variant) => variant.is_active
    );

  const sizes = Array.from(
    new Set(
      activeVariants
        .map((variant) => variant.size)
        .filter(
          (size): size is string =>
            Boolean(size)
        )
    )
  );

  const colors = Array.from(
    new Set(
      activeVariants
        .map((variant) => variant.color)
        .filter(
          (color): color is string =>
            Boolean(color)
        )
    )
  );

  const [selectedImage, setSelectedImage] =
    useState<string | null>(
      sortedImages[0]?.image_url ?? null
    );

  const [selectedSize, setSelectedSize] =
    useState<string | null>(
      sizes.length === 1
        ? sizes[0]
        : null
    );

  const [selectedColor, setSelectedColor] =
    useState<string | null>(
      colors.length === 1
        ? colors[0]
        : null
    );

  const [quantity, setQuantity] =
    useState(1);

  const selectedVariant =
    activeVariants.find(
      (variant) =>
        (variant.size === null ||
          variant.size === selectedSize) &&
        (variant.color === null ||
          variant.color === selectedColor)
    ) ?? null;

  const currentPrice =
    selectedVariant?.sale_price ??
    selectedVariant?.regular_price ??
    product.sale_price ??
    product.regular_price;

  const currentStock =
    selectedVariant
      ? selectedVariant.stock_quantity
      : product.stock_quantity;

  const requiresSize =
    sizes.length > 0;

  const requiresColor =
    colors.length > 0;

  const canAddToCart =
    currentStock > 0 &&
    (!requiresSize ||
      selectedSize !== null) &&
    (!requiresColor ||
      selectedColor !== null);

  function handleAddToCart() {
    if (!canAddToCart) {
      return;
    }

    addToCart({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      variantId:
        selectedVariant?.id ?? null,
      variant: selectedVariant,
      imageUrl: selectedImage,
      size:
        selectedVariant?.size ??
        selectedSize,
      color:
        selectedVariant?.color ??
        selectedColor,
      price: Number(currentPrice),
      quantity,
    });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* Product Gallery */}

      <div>
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100">
          {selectedImage ? (
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-neutral-400">
              No image available
            </div>
          )}
        </div>

        {sortedImages.length > 1 && (
          <div className="mt-4 grid grid-cols-5 gap-3">
            {sortedImages.map((image) => (
              <button
                key={image.id}
                type="button"
                onClick={() =>
                  setSelectedImage(
                    image.image_url
                  )
                }
                className={`relative aspect-square overflow-hidden rounded-lg border-2 ${
                  selectedImage ===
                  image.image_url
                    ? "border-sky-600"
                    : "border-transparent"
                }`}
              >
                <Image
                  src={image.image_url}
                  alt={
                    image.alt_text ||
                    product.name
                  }
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Information */}

      <div className="flex flex-col">
        {product.brand_name && (
          <p className="text-sm font-semibold uppercase tracking-widest text-sky-600">
            {product.brand_name}
          </p>
        )}

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
          {product.name}
        </h1>

        {product.category_name && (
          <p className="mt-2 text-sm text-neutral-500">
            {product.category_name}
          </p>
        )}

        {/* Price */}

        <div className="mt-6 flex items-center gap-3">
          <span className="text-2xl font-bold text-neutral-950">
            ৳{Number(currentPrice).toFixed(2)}
          </span>

          {!selectedVariant &&
            product.sale_price !== null && (
              <span className="text-base text-neutral-400 line-through">
                ৳
                {Number(
                  product.regular_price
                ).toFixed(2)}
              </span>
            )}

          {selectedVariant &&
            selectedVariant.sale_price !== null &&
            selectedVariant.regular_price !==
              null && (
              <span className="text-base text-neutral-400 line-through">
                ৳
                {Number(
                  selectedVariant.regular_price
                ).toFixed(2)}
              </span>
            )}
        </div>

        {/* Short Description */}

        {product.short_description && (
          <p className="mt-6 leading-7 text-neutral-600">
            {product.short_description}
          </p>
        )}

        <div className="my-8 border-t" />

        {/* Size */}

        {sizes.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                Size
              </h2>

              {selectedSize && (
                <span className="text-sm text-neutral-500">
                  {selectedSize}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() =>
                    setSelectedSize(size)
                  }
                  className={`min-w-14 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                    selectedSize === size
                      ? "border-sky-600 bg-sky-600 text-white"
                      : "border-neutral-300 hover:border-neutral-500"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color */}

        {colors.length > 0 && (
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                Color
              </h2>

              {selectedColor && (
                <span className="text-sm text-neutral-500">
                  {selectedColor}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() =>
                    setSelectedColor(color)
                  }
                  className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                    selectedColor === color
                      ? "border-sky-600 bg-sky-600 text-white"
                      : "border-neutral-300 hover:border-neutral-500"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stock */}

        <div className="mt-6">
          {currentStock > 0 ? (
            <p className="text-sm font-medium text-green-600">
              {currentStock} available
            </p>
          ) : (
            <p className="text-sm font-medium text-red-600">
              Out of stock
            </p>
          )}
        </div>

        {/* Quantity */}

        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold">
            Quantity
          </h2>

          <div className="flex w-fit items-center overflow-hidden rounded-lg border">
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={() =>
                setQuantity((value) =>
                  Math.max(1, value - 1)
                )
              }
              className="p-3 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus size={16} />
            </button>

            <span className="min-w-12 text-center text-sm font-semibold">
              {quantity}
            </span>

            <button
              type="button"
              disabled={
                quantity >= currentStock
              }
              onClick={() =>
                setQuantity((value) =>
                  Math.min(
                    currentStock,
                    value + 1
                  )
                )
              }
              className="p-3 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Add to Cart */}

        <button
          type="button"
          disabled={!canAddToCart}
          onClick={handleAddToCart}
          className="mt-8 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          <ShoppingBag size={18} />

          {currentStock <= 0
            ? "Out of Stock"
            : !canAddToCart
              ? "Select Options"
              : "Add to Cart"}
        </button>

        {/* Description */}

        {product.description && (
          <div className="mt-10 border-t pt-8">
            <h2 className="text-lg font-semibold">
              Description
            </h2>

            <div className="mt-4 whitespace-pre-line text-sm leading-7 text-neutral-600">
              {product.description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}