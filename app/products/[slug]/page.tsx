import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ProductDetails } from "@/components/shop/product-details";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  /* =========================================================
     PRODUCT
  ========================================================= */

  const {
    data: product,
    error: productError,
  } = await supabase
    .from("products")
    .select(`
      id,
      category_id,
      brand_id,
      name,
      slug,
      short_description,
      description,
      regular_price,
      sale_price,
      stock_quantity,
      status
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (productError) {
    console.error(
      "Product fetch error:",
      productError.message
    );

    notFound();
  }

  if (!product) {
    notFound();
  }

  /* =========================================================
     CATEGORY + BRAND + IMAGES + VARIANTS
  ========================================================= */

  const [
    categoryResult,
    brandResult,
    imagesResult,
    variantsResult,
  ] = await Promise.all([
    /* -------------------------------------------------------
       CATEGORY
    ------------------------------------------------------- */

    product.category_id
      ? supabase
          .from("categories")
          .select("name")
          .eq(
            "id",
            product.category_id
          )
          .maybeSingle()
      : Promise.resolve({
          data: null,
          error: null,
        }),

    /* -------------------------------------------------------
       BRAND
    ------------------------------------------------------- */

    product.brand_id
      ? supabase
          .from("brands")
          .select("name")
          .eq(
            "id",
            product.brand_id
          )
          .maybeSingle()
      : Promise.resolve({
          data: null,
          error: null,
        }),

    /* -------------------------------------------------------
       PRODUCT IMAGES
    ------------------------------------------------------- */

    supabase
      .from("product_images")
      .select(`
        id,
        image_url,
        alt_text,
        is_primary,
        sort_order
      `)
      .eq(
        "product_id",
        product.id
      )
      .order(
        "sort_order",
        {
          ascending: true,
        }
      ),

    /* -------------------------------------------------------
       PRODUCT VARIANTS
    ------------------------------------------------------- */

    supabase
      .from("product_variants")
      .select(`
        id,
        product_id,
        sku,
        color,
        size,
        price,
        discount_price,
        purchase_cost,
        stock_quantity,
        low_stock_threshold,
        barcode,
        created_at,
        updated_at
      `)
      .eq(
        "product_id",
        product.id
      )
      .order(
        "size",
        {
          ascending: true,
        }
      ),
  ]);

  /* =========================================================
     ERROR HANDLING
  ========================================================= */

  if (imagesResult.error) {
    console.error(
      "Product images fetch error:",
      imagesResult.error.message
    );
  }

  if (variantsResult.error) {
    console.error(
      "Product variants fetch error:",
      variantsResult.error.message
    );
  }

  /* =========================================================
     CATEGORY NAME
  ========================================================= */

  const categoryName =
    categoryResult.data?.name ??
    null;

  /* =========================================================
     BRAND NAME
  ========================================================= */

  const brandName =
    brandResult.data?.name ??
    null;

  /* =========================================================
     PRODUCT IMAGES
  ========================================================= */

  const images =
    (imagesResult.data ?? []).map(
      (image) => ({
        id: image.id,

        image_url:
          image.image_url,

        alt_text:
          image.alt_text ??
          null,

        is_primary:
          image.is_primary ??
          false,

        sort_order:
          image.sort_order ??
          0,
      })
    );

  /* =========================================================
     PRODUCT VARIANTS
  ========================================================= */

  const variants =
    (variantsResult.data ?? []).map(
      (variant) => ({
        id: variant.id,

        product_id:
          variant.product_id,

        sku:
          variant.sku ??
          null,

        color:
          variant.color ??
          null,

        size:
          variant.size ??
          null,

        regular_price:
          Number(
            variant.price ??
              product.regular_price ??
              0
          ),

        sale_price:
          variant.discount_price !==
          null
            ? Number(
                variant.discount_price
              )
            : null,

        purchase_cost:
          Number(
            variant.purchase_cost ??
              0
          ),

        stock_quantity:
          Number(
            variant.stock_quantity ??
              0
          ),

        low_stock_threshold:
          Number(
            variant.low_stock_threshold ??
              3
          ),

        is_active: true,

        created_at:
          variant.created_at,

        updated_at:
          variant.updated_at,
      })
    );

  /* =========================================================
     RELATED PRODUCTS

     Same category
     Current product excluded
     Only active products
     Maximum 4 products
  ========================================================= */

  let relatedProducts: {
    id: string;
    name: string;
    slug: string;
    regular_price: number;
    sale_price: number | null;
    image_url: string | null;
  }[] = [];

  if (product.category_id) {
    const {
      data: relatedData,
      error: relatedError,
    } = await supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        regular_price,
        sale_price
      `)
      .eq(
        "category_id",
        product.category_id
      )
      .eq(
        "status",
        "active"
      )
      .neq(
        "id",
        product.id
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(4);

    if (relatedError) {
      console.error(
        "Related products fetch error:",
        relatedError.message
      );
    } else if (
      relatedData &&
      relatedData.length > 0
    ) {
      /* -----------------------------------------------------
         GET PRIMARY IMAGES
      ----------------------------------------------------- */

      const relatedWithImages =
        await Promise.all(
          relatedData.map(
            async (
              relatedProduct
            ) => {
              const {
                data: imageData,
              } = await supabase
                .from(
                  "product_images"
                )
                .select(
                  "image_url, is_primary, sort_order"
                )
                .eq(
                  "product_id",
                  relatedProduct.id
                )
                .order(
                  "is_primary",
                  {
                    ascending:
                      false,
                  }
                )
                .order(
                  "sort_order",
                  {
                    ascending:
                      true,
                  }
                )
                .limit(1)
                .maybeSingle();

              return {
                id:
                  relatedProduct.id,

                name:
                  relatedProduct.name,

                slug:
                  relatedProduct.slug,

                regular_price:
                  Number(
                    relatedProduct.regular_price ??
                      0
                  ),

                sale_price:
                  relatedProduct.sale_price !==
                  null
                    ? Number(
                        relatedProduct.sale_price
                      )
                    : null,

                image_url:
                  imageData?.image_url ??
                  null,
              };
            }
          )
        );

      relatedProducts =
        relatedWithImages;
    }
  }

  /* =========================================================
     PRODUCT DETAILS DATA
  ========================================================= */

  const productDetails = {
    id: product.id,

    name: product.name,

    slug: product.slug,

    short_description:
      product.short_description ??
      null,

    description:
      product.description ??
      null,

    regular_price:
      Number(
        product.regular_price ??
          0
      ),

    sale_price:
      product.sale_price !==
      null
        ? Number(
            product.sale_price
          )
        : null,

    stock_quantity:
      Number(
        product.stock_quantity ??
          0
      ),

    category_name:
      categoryName,

    brand_name:
      brandName,

    images,

    variants,
  };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-white">
      <ProductDetails
        product={
          productDetails
        }
        relatedProducts={
          relatedProducts
        }
      />
    </main>
  );
}