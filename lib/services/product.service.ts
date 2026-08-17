import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/product";

export type PaginatedProducts = {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(
        id,
        name
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

export async function getProductsPaginated(
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedProducts> {
  const supabase = await createClient();

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

  const { data, error, count } =
    await supabase
      .from("products")
      .select(
        `
          *,
          category:categories(
            id,
            name
          ),
          brand:brands(
            id,
            name
          )
        `,
        {
          count: "exact",
        }
      )
      .order("created_at", {
        ascending: false,
      })
      .range(from, to);

  if (error) {
    throw error;
  }

  const total = count ?? 0;

  return {
    products: (data ?? []) as Product[],
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages:
      total === 0
        ? 1
        : Math.ceil(
            total / safePageSize
          ),
  };
}

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
        name
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