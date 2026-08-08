import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";

import { getProducts } from "@/lib/services/product.service";

function formatCurrency(value: number) {
  return `৳${value.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function ProductInventoryPage() {
  const products = await getProducts();

  const totalStock = products.reduce(
    (sum, product) =>
      sum + Number(product.stock_quantity),
    0
  );

  const inStockProducts = products.filter(
    (product) =>
      Number(product.stock_quantity) >
      Number(product.low_stock_threshold)
  );

  const lowStockProducts = products.filter(
    (product) => {
      const stock = Number(product.stock_quantity);
      const threshold = Number(
        product.low_stock_threshold
      );

      return stock > 0 && stock <= threshold;
    }
  );

  const outOfStockProducts = products.filter(
    (product) =>
      Number(product.stock_quantity) <= 0
  );

  const totalPurchaseValue = products.reduce(
    (sum, product) =>
      sum +
      Number(product.purchase_cost) *
        Number(product.stock_quantity),
    0
  );

  const potentialSalesValue = products.reduce(
    (sum, product) => {
      const sellingPrice =
        product.sale_price ??
        product.regular_price;

      return (
        sum +
        Number(sellingPrice) *
          Number(product.stock_quantity)
      );
    },
    0
  );

  const expectedProfit =
    potentialSalesValue - totalPurchaseValue;

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Inventory
          </h1>

          <p className="mt-2 text-neutral-500">
            Monitor product stock and inventory value.
          </p>
        </div>

        <Link
          href="/admin/products"
          className="rounded-lg border px-5 py-3 text-sm font-medium transition hover:bg-neutral-50"
        >
          Back to Products
        </Link>
      </div>

      {/* Summary Cards */}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">
            Total Stock Units
          </p>

          <p className="mt-2 text-3xl font-bold">
            {totalStock}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">
            In Stock
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {inStockProducts.length}
          </p>

          <p className="mt-1 text-xs text-neutral-500">
            Products
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">
            Low Stock
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {lowStockProducts.length}
          </p>

          <p className="mt-1 text-xs text-neutral-500">
            Need attention
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">
            Out of Stock
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {outOfStockProducts.length}
          </p>

          <p className="mt-1 text-xs text-neutral-500">
            Products
          </p>
        </div>
      </div>

      {/* Inventory Value */}

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">
            Current Stock Cost
          </p>

          <p className="mt-2 text-2xl font-bold">
            {formatCurrency(totalPurchaseValue)}
          </p>

          <p className="mt-2 text-xs text-neutral-500">
            Purchase cost × current stock
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">
            Potential Sales Value
          </p>

          <p className="mt-2 text-2xl font-bold">
            {formatCurrency(potentialSalesValue)}
          </p>

          <p className="mt-2 text-xs text-neutral-500">
            Current stock × selling price
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">
            Expected Profit
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {formatCurrency(expectedProfit)}
          </p>

          <p className="mt-2 text-xs text-neutral-500">
            Potential sales − stock cost
          </p>
        </div>
      </div>

      {/* Stock Table */}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-6 py-5">
          <h2 className="text-lg font-semibold">
            Stock Overview
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-6 py-4 text-left">
                  Product
                </th>

                <th className="px-6 py-4 text-left">
                  SKU
                </th>

                <th className="px-6 py-4 text-right">
                  Stock
                </th>

                <th className="px-6 py-4 text-right">
                  Alert At
                </th>

                <th className="px-6 py-4 text-right">
                  Purchase Cost
                </th>

                <th className="px-6 py-4 text-right">
                  Stock Value
                </th>

                <th className="px-6 py-4 text-center">
                  Status
                </th>

                <th className="px-6 py-4 text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => {
                const stock = Number(
                  product.stock_quantity
                );

                const threshold = Number(
                  product.low_stock_threshold
                );

                const purchaseCost = Number(
                  product.purchase_cost
                );

                const stockValue =
                  stock * purchaseCost;

                const isOutOfStock = stock <= 0;

                const isLowStock =
                  stock > 0 && stock <= threshold;

                return (
                  <tr
                    key={product.id}
                    className="border-t transition hover:bg-neutral-50"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium">
                        {product.name}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {product.sku || "-"}
                    </td>

                    <td className="px-6 py-4 text-right font-semibold">
                      {stock}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {threshold}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {formatCurrency(purchaseCost)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {formatCurrency(stockValue)}
                    </td>

                    <td className="px-6 py-4 text-center">
                      {isOutOfStock ? (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                          Low Stock
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          In Stock
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <Link
                          href={`/admin/products/inventory/${product.id}`}
                          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-neutral-50"
                        >
                          <Package size={16} />

                          Manage

                          <ArrowRight size={15} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-neutral-500"
                  >
                    No products available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}