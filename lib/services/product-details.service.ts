import { createClient } from "@/lib/supabase/server";

/* =========================================================
   TYPES
========================================================= */

export type ProductDetailVariant = {
  id: string;
  sku: string | null;
  color: string | null;
  size: string | null;
  price: number | null;
  discount_price: number | null;
  stock_quantity: number;
  barcode: string | null;
};

export type ProductDetailImage = {
  id: string;
  image_url: string | null;
  storage_path: string | null;
  sort_order: number;
  is_primary: boolean;
};

export type ProductDetail = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  brand: string | null;
  brand_id: string | null;
  short_description: string | null;
  description: string | null;
  sku: string | null;

  purchase_cost: number;
  regular_price: number;
  sale_price: number | null;

  featured: boolean;
  new_arrival: boolean;
  status: string;

  variants: ProductDetailVariant[];
  images: ProductDetailImage[];
};


/* =========================================================
   GET PRODUCT BY SLUG
========================================================= */

export async function getProductDetailsBySlug(
  slug: string
): Promise<ProductDetail | null> {
  const supabase = await createClient();

  if (!slug) {
    return null;
  }

  /* -------------------------------------------------------
     PRODUCT
  ------------------------------------------------------- */

  const {
    data: product,
    error: productError,
  } = await supabase
    .from("products")
    .select(
      `
        id,
        category_id,
        name,
        slug,
        brand,
        brand_id,
        short_description,
        description,
        sku,
        purchase_cost,
        regular_price,
        sale_price,
        featured,
        new_arrival,
        status
      `
    )
    .eq("slug", slug)
    .maybeSingle();

  if (productError) {
    throw new Error(productError.message);
  }

  if (!product) {
    return null;
  }


  /* -------------------------------------------------------
     PRODUCT VARIANTS
  ------------------------------------------------------- */

  const {
    data: variants,
    error: variantsError,
  } = await supabase
    .from("product_variants")
    .select(
      `
        id,
        sku,
        color,
        size,
        price,
        discount_price,
        stock_quantity,
        barcode
      `
    )
    .eq("product_id", product.id)
    .order("color", {
      ascending: true,
    })
    .order("size", {
      ascending: true,
    });

  if (variantsError) {
    throw new Error(variantsError.message);
  }


  /* -------------------------------------------------------
     PRODUCT IMAGES
  ------------------------------------------------------- */

  const {
    data: images,
    error: imagesError,
  } = await supabase
    .from("product_images")
    .select(
      `
        id,
        image_url,
        storage_path,
        sort_order,
        is_primary
      `
    )
    .eq("product_id", product.id)
    .order("is_primary", {
      ascending: false,
    })
    .order("sort_order", {
      ascending: true,
    });

  if (imagesError) {
    throw new Error(imagesError.message);
  }


  /* -------------------------------------------------------
     RETURN
  ------------------------------------------------------- */

  return {
    ...product,

    purchase_cost: Number(
      product.purchase_cost ?? 0
    ),

    regular_price: Number(
      product.regular_price ?? 0
    ),

    sale_price:
      product.sale_price === null
        ? null
        : Number(product.sale_price),

    variants: (variants ?? []).map(
      (variant) => ({
        ...variant,

        price:
          variant.price === null
            ? null
            : Number(variant.price),

        discount_price:
          variant.discount_price === null
            ? null
            : Number(
                variant.discount_price
              ),

        stock_quantity: Number(
          variant.stock_quantity ?? 0
        ),
      })
    ),

    images: images ?? [],
  };
}