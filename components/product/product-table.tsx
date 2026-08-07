import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

import type { Product } from "@/types/product";
import { ProductProfit } from "./product-profit";
import { ProductStock } from "./product-stock";

type ProductTableProps = {
  products: Product[];
};

export function ProductTable({
  products,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center text-neutral-500">
        No products found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <table className="w-full">
        <thead className="bg-neutral-100">
          <tr>
            <th className="px-6 py-4 text-left font-semibold">
              Product
            </th>

            <th className="px-6 py-4 text-left font-semibold">
              SKU
            </th>

            <th className="px-6 py-4 text-right font-semibold">
              Purchase
            </th>

            <th className="px-6 py-4 text-right font-semibold">
              Regular
            </th>

            <th className="px-6 py-4 text-right font-semibold">
              Sale
            </th>

            <th className="px-6 py-4 text-right font-semibold">
              Profit
            </th>

            <th className="px-6 py-4 text-center font-semibold">
              Inventory
            </th>

            <th className="px-6 py-4 text-center font-semibold">
              Status
            </th>

            <th className="px-6 py-4 text-center font-semibold">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              className="border-t transition hover:bg-neutral-50"
            >
              <td className="px-6 py-4">
                <div className="font-semibold">
                  {product.name}
                </div>

                {product.short_description && (
                  <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
                    {product.short_description}
                  </p>
                )}
              </td>

              <td className="px-6 py-4">
                {product.sku || "-"}
              </td>

              <td className="px-6 py-4 text-right">
                ৳
                {Number(
                  product.purchase_cost
                ).toFixed(2)}
              </td>

              <td className="px-6 py-4 text-right">
                ৳
                {Number(
                  product.regular_price
                ).toFixed(2)}
              </td>

              <td className="px-6 py-4 text-right">
                {product.sale_price ? (
                  <>৳{Number(product.sale_price).toFixed(2)}</>
                ) : (
                  "-"
                )}
              </td>

              <td className="px-6 py-4 text-right">
                <ProductProfit
                  purchaseCost={product.purchase_cost}
                  regularPrice={product.regular_price}
                  salePrice={product.sale_price}
                />
              </td>

              <td className="px-6 py-4 text-center">
                <ProductStock
                  stock={product.stock_quantity}
                  lowStock={product.low_stock_threshold}
                />
              </td>

              <td className="px-6 py-4 text-center">
                {product.is_active ? (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    Active
                  </span>
                ) : (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                    Inactive
                  </span>
                )}
              </td>

              <td className="px-6 py-4">
                <div className="flex justify-center gap-2">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="rounded-lg border p-2 transition hover:bg-sky-50 hover:text-sky-600"
                  >
                    <Pencil size={18} />
                  </Link>

                  <button
                    type="button"
                    className="rounded-lg border p-2 text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}