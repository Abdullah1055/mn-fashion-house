import Link from "next/link";

import { ProductTable } from "@/components/product/product-table";
import { getProducts } from "@/lib/services/product.service";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Products
          </h1>

          <p className="mt-2 text-neutral-500">
            Total Products: {products.length}
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="rounded-lg bg-sky-600 px-5 py-3 text-white hover:bg-sky-700"
        >
          + Add Product
        </Link>
      </div>

      <ProductTable
        products={products}
      />
    </div>
  );
}