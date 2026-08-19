import { createClient } from "@/lib/supabase/server";

import { getProducts } from "@/lib/services/product.service";
import { getActiveCategories } from "@/lib/services/category.service";
import { getBrands } from "@/lib/services/brand.service";
import { getProductImages } from "@/lib/services/product-image.service";

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  regular_price: number;
  sale_price: number | null;
  stock_quantity: number;
  is_featured: boolean;
  is_active: boolean;
  category_id: string;
  brand_id: string | null;
  category_name: string | null;
  brand_name: string | null;
  image_url: string | null;
};

export async function getCatalogProducts(): Promise<
  CatalogProduct[]
> {
  const [
    products,
    categories,
    brands,
  ] = await Promise.all([
    getProducts(),
    getActiveCategories(),
    getBrands(),
  ]);

  const categoryMap = new Map(
    categories.map((category) => [
      category.id,
      category.name,
    ])
  );

  const brandMap = new Map(
    brands.map((brand) => [
      brand.id,
      brand.name,
    ])
  );

  const catalogProducts =
    await Promise.all(
      products
        .filter(
          (product) =>
            product.is_active
        )
        .map(async (product) => {
          const images =
            await getProductImages(
              product.id
            );

          const primaryImage =
            images.find(
              (image) =>
                image.is_primary
            ) ||
            images[0] ||
            null;

          return {
            id: product.id,

            name: product.name,

            slug: product.slug,

            short_description:
              product.short_description,

            regular_price:
              Number(
                product.regular_price
              ),

            sale_price:
              product.sale_price !==
              null
                ? Number(
                    product.sale_price
                  )
                : null,

            stock_quantity:
              product.stock_quantity,

            is_featured:
              product.is_featured,

            is_active:
              product.is_active,

            category_id:
              product.category_id,

            brand_id:
              product.brand_id,

            category_name:
              categoryMap.get(
                product.category_id
              ) || null,

            brand_name:
              product.brand_id
                ? brandMap.get(
                    product.brand_id
                  ) || null
                : null,

            image_url:
              primaryImage?.image_url ||
              null,
          };
        })
    );

  return catalogProducts;
}

export async function getCatalogProductBySlug(
  slug: string
) {
  const supabase =
    await createClient();

  const { data: product, error } =
    await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

  if (error) {
    throw error;
  }

  if (!product) {
    return null;
  }

  const [
    categories,
    brands,
    images,
  ] = await Promise.all([
    getActiveCategories(),
    getBrands(),
    getProductImages(product.id),
  ]);

  const category =
    categories.find(
      (item) =>
        item.id ===
        product.category_id
    ) || null;

  const brand =
    product.brand_id
      ? brands.find(
          (item) =>
            item.id ===
            product.brand_id
        ) || null
      : null;

  return {
    ...product,

    regular_price:
      Number(
        product.regular_price
      ),

    sale_price:
      product.sale_price !==
      null
        ? Number(
            product.sale_price
          )
        : null,

    purchase_cost:
      Number(
        product.purchase_cost
      ),

    category_name:
      category?.name || null,

    brand_name:
      brand?.name || null,

    images,
  };
}