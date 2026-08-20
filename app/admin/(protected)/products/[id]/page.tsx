import { notFound } from "next/navigation";

import { ProductForm } from "@/components/product/product-form";

import { createClient } from "@/lib/supabase/server";

import { getProductById } from "@/lib/services/product.service";
import { getActiveCategories } from "@/lib/services/category.service";
import { getBrands } from "@/lib/services/brand.service";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  /* =========================================================
     LOAD PRODUCT + CATEGORIES + BRANDS
  ========================================================= */

  const [product, categories, brands] =
    await Promise.all([
      getProductById(id),
      getActiveCategories(),
      getBrands(),
    ]);

  if (!product) {
    notFound();
  }

  /* =========================================================
     LOAD EXISTING PRODUCT VARIANTS
     
     IMPORTANT:
     Edit Product page must load existing sizes and quantities.
  ========================================================= */

  const supabase =
    await createClient();

  const {
    data: variants,
    error: variantsError,
  } = await supabase
    .from("product_variants")
    .select(`
      id,
      size,
      stock_quantity
    `)
    .eq(
      "product_id",
      id
    )
    .order(
      "size",
      {
        ascending: true,
      }
    );

  if (variantsError) {
    console.error(
      "Edit product variants fetch error:",
      variantsError.message
    );
  }

  /* =========================================================
     MERGE EXISTING VARIANTS WITH PRODUCT
     
     ProductForm expects:
       product.variants[]

     Each variant contains:
       id
       size
       stock_quantity
  ========================================================= */

  const productWithVariants = {
    ...product,

    variants:
      (variants ?? []).map(
        (variant) => ({
          id: variant.id,

          size:
            variant.size ?? null,

          stock_quantity:
            Number(
              variant.stock_quantity ??
                0
            ),
        })
      ),
  };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="space-y-8">
      {/* -----------------------------------------------------
          PAGE HEADER
      ----------------------------------------------------- */}

      <div>
        <h1 className="text-3xl font-bold">
          Edit Product
        </h1>

        <p className="mt-2 text-neutral-500">
          Update product information and
          inventory settings.
        </p>
      </div>

      {/* -----------------------------------------------------
          PRODUCT FORM
          
          Existing variants are now passed here.
      ----------------------------------------------------- */}

      <ProductForm
        categories={categories}
        brands={brands}
        product={
          productWithVariants
        }
      />
    </div>
  );
}