import { getProducts } from "@/lib/services/product.service";

function formatCurrency(value: number) {
  return `৳${value.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function ProductAnalyticsPage() {
  const products = await getProducts();

  const totalProducts = products.length;

  const totalStockUnits = products.reduce(
    (total, product) =>
      total + Number(product.stock_quantity),
    0
  );

  const totalPurchaseValue = products.reduce(
    (total, product) =>
      total +
      Number(product.purchase_cost) *
        Number(product.stock_quantity),
    0
  );

  const potentialSalesValue = products.reduce(
    (total, product) => {
      const sellingPrice =
        product.sale_price ??
        product.regular_price;

      return (
        total +
        Number(sellingPrice) *
          Number(product.stock_quantity)
      );
    },
    0
  );

  const expectedProfit =
    potentialSalesValue - totalPurchaseValue;

  const averageProfit =
    totalProducts > 0
      ? expectedProfit / totalProducts
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold">
          Product Financial Summary
        </h1>

        <p className="mt-2 text-neutral-500">
          Overview of product cost, stock value,
          potential sales and expected profit.
        </p>
      </div>

      {/* Summary Cards */}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Products */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">
            Total Products
          </p>

          <p className="mt-2 text-3xl font-bold">
            {totalProducts}
          </p>
        </div>

        {/* Stock */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">
            Total Stock Units
          </p>

          <p className="mt-2 text-3xl font-bold">
            {totalStockUnits}
          </p>
        </div>

        {/* Purchase Value */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">
            Total Purchase Value
          </p>

          <p className="mt-2 text-3xl font-bold">
            {formatCurrency(totalPurchaseValue)}
          </p>

          <p className="mt-2 text-xs text-neutral-500">
            Current stock × purchase cost
          </p>
        </div>

        {/* Potential Sales */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">
            Potential Sales Value
          </p>

          <p className="mt-2 text-3xl font-bold">
            {formatCurrency(potentialSalesValue)}
          </p>

          <p className="mt-2 text-xs text-neutral-500">
            Current stock × selling price
          </p>
        </div>

        {/* Expected Profit */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">
            Expected Profit
          </p>

          <p
            className={`mt-2 text-3xl font-bold ${
              expectedProfit >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {formatCurrency(expectedProfit)}
          </p>

          <p className="mt-2 text-xs text-neutral-500">
            Potential sales − purchase value
          </p>
        </div>

        {/* Average Profit */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">
            Average Profit / Product
          </p>

          <p
            className={`mt-2 text-3xl font-bold ${
              averageProfit >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {formatCurrency(averageProfit)}
          </p>
        </div>
      </div>

      {/* Product Financial Table */}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-6 py-5">
          <h2 className="text-lg font-semibold">
            Product Financial Breakdown
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-6 py-4 text-left">
                  Product
                </th>

                <th className="px-6 py-4 text-right">
                  Stock
                </th>

                <th className="px-6 py-4 text-right">
                  Purchase Cost
                </th>

                <th className="px-6 py-4 text-right">
                  Selling Price
                </th>

                <th className="px-6 py-4 text-right">
                  Stock Cost
                </th>

                <th className="px-6 py-4 text-right">
                  Potential Sales
                </th>

                <th className="px-6 py-4 text-right">
                  Expected Profit
                </th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => {
                const stock = Number(
                  product.stock_quantity
                );

                const purchaseCost = Number(
                  product.purchase_cost
                );

                const sellingPrice = Number(
                  product.sale_price ??
                    product.regular_price
                );

                const stockCost =
                  purchaseCost * stock;

                const potentialSales =
                  sellingPrice * stock;

                const profit =
                  potentialSales - stockCost;

                return (
                  <tr
                    key={product.id}
                    className="border-t hover:bg-neutral-50"
                  >
                    <td className="px-6 py-4 font-medium">
                      {product.name}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {stock}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {formatCurrency(
                        purchaseCost
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {formatCurrency(
                        sellingPrice
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {formatCurrency(stockCost)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {formatCurrency(
                        potentialSales
                      )}
                    </td>

                    <td
                      className={`px-6 py-4 text-right font-semibold ${
                        profit >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(profit)}
                    </td>
                  </tr>
                );
              })}

              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
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