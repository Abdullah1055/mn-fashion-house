import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/product";

export type PaginatedProducts = {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/* =========================================================
   UUID VALIDATION
========================================================= */

function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

/* =========================================================
   GET ALL PRODUCTS
========================================================= */

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(
        id,
        name,
        parent_id
      ),
      brand:brands(
        id,
        name
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data as Product[];
}

/* =========================================================
   GET PAGINATED PRODUCTS
========================================================= */

export async function getProductsPaginated(
  page: number = 1,
  pageSize: number = 10,
  search: string = "",
  mainCategoryId: string = "",
  categoryId: string = ""
): Promise<PaginatedProducts> {
  const supabase = await createClient();

  /* -------------------------------------------------------
     Safe pagination
  ------------------------------------------------------- */

  const safePage =
    Number.isFinite(page) && page > 0
      ? Math.floor(page)
      : 1;

  const allowedPageSizes = [
    10,
    20,
    50,
  ];

  const safePageSize =
    allowedPageSizes.includes(pageSize)
      ? pageSize
      : 10;

  const from =
    (safePage - 1) * safePageSize;

  const to =
    from + safePageSize - 1;

  /* -------------------------------------------------------
     Base query
  ------------------------------------------------------- */

  let query = supabase
    .from("products")
    .select(
      `
        *,
        category:categories(
          id,
          name,
          parent_id
        ),
        brand:brands(
          id,
          name
        )
      `,
      {
        count: "exact",
      }
    );

  /* -------------------------------------------------------
     Search
  ------------------------------------------------------- */

  const searchValue =
    search.trim();

  if (searchValue) {
    query = query.or(
      `name.ilike.%${searchValue}%,slug.ilike.%${searchValue}%,sku.ilike.%${searchValue}%,color.ilike.%${searchValue}%`
    );
  }

  /* -------------------------------------------------------
     Category Filter
  ------------------------------------------------------- */

  if (
    categoryId &&
    categoryId !== "all" &&
    isValidUUID(categoryId)
  ) {
    query = query.eq(
      "category_id",
      categoryId
    );
  }

  /* -------------------------------------------------------
     Main Category Filter
  ------------------------------------------------------- */

  if (
    mainCategoryId &&
    mainCategoryId !== "all" &&
    isValidUUID(mainCategoryId)
  ) {
    const {
      data: childCategories,
      error: childCategoryError,
    } = await supabase
      .from("categories")
      .select("id")
      .eq(
        "parent_id",
        mainCategoryId
      );

    if (childCategoryError) {
      throw childCategoryError;
    }

    const childCategoryIds =
      (childCategories ?? []).map(
        (category) => category.id
      );

    /*
     * No child categories means
     * no products under this Main Category.
     */

    if (
      childCategoryIds.length === 0
    ) {
      return {
        products: [],
        total: 0,
        page: safePage,
        pageSize: safePageSize,
        totalPages: 1,
      };
    }

    query = query.in(
      "category_id",
      childCategoryIds
    );
  }

  /* -------------------------------------------------------
     Execute
  ------------------------------------------------------- */

  const {
    data,
    error,
    count,
  } = await query
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  if (error) {
    throw error;
  }

  const total =
    count ?? 0;

  return {
    products:
      (data ?? []) as Product[],

    total,

    page: safePage,

    pageSize:
      safePageSize,

    totalPages:
      total === 0
        ? 1
        : Math.ceil(
            total / safePageSize
          ),
  };
}

/* =========================================================
   GET PRODUCT BY ID
========================================================= */

export async function getProductById(
  id: string
): Promise<Product | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(
        id,
        name,
        parent_id
      ),
      brand:brands(
        id,
        name
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return data as Product;
}