import {
  getDashboardInventory,
  getDashboardStats,
} from "@/lib/services/dashboard.service";

function formatCurrency(amount: number) {
  return `৳${Number(amount || 0).toLocaleString(
    "en-BD",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  )}`;
}

function getStockStatus(
  quantity: number,
  threshold: number
) {
  if (quantity <= 0) {
    return {
      label: "Out of Stock",
      className:
        "bg-red-100 text-red-700",
    };
  }

  if (quantity <= threshold) {
    return {
      label: "Low Stock",
      className:
        "bg-amber-100 text-amber-700",
    };
  }

  return {
    label: "In Stock",
    className:
      "bg-green-100 text-green-700",
  };
}

export default async function DashboardPage() {
  const [
    stats,
    inventory,
  ] = await Promise.all([
    getDashboardStats(),
    getDashboardInventory(),
  ]);

  return (
    <div className="space-y-8">

      {/* =====================================================
          BUSINESS OVERVIEW
      ====================================================== */}

      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-neutral-900">
            Business Overview
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Overview of your store performance.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          {/* Products */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-neutral-500">
              Products
            </p>

            <h3 className="mt-3 text-3xl font-bold text-neutral-900">
              {stats.totalProducts}
            </h3>

            <p className="mt-2 text-xs text-neutral-400">
              Total products
            </p>
          </div>

          {/* Categories */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-neutral-500">
              Categories
            </p>

            <h3 className="mt-3 text-3xl font-bold text-neutral-900">
              {stats.totalCategories}
            </h3>

            <p className="mt-2 text-xs text-neutral-400">
              Total categories
            </p>
          </div>

          {/* Orders */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-neutral-500">
              Orders
            </p>

            <h3 className="mt-3 text-3xl font-bold text-neutral-900">
              {stats.totalOrders}
            </h3>

            <p className="mt-2 text-xs text-neutral-400">
              Non-cancelled orders
            </p>
          </div>

          {/* Revenue */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-neutral-500">
              Revenue
            </p>

            <h3 className="mt-3 text-3xl font-bold text-neutral-900">
              {formatCurrency(
                stats.totalRevenue
              )}
            </h3>

            <p className="mt-2 text-xs text-neutral-400">
              Total non-cancelled sales
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          SALES STATISTICS
      ====================================================== */}

      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-neutral-900">
            Sales Statistics
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Sales performance across different
            time periods.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          {/* Today */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-neutral-500">
              Today
            </p>

            <h3 className="mt-3 text-2xl font-bold text-neutral-900">
              {formatCurrency(
                stats.todaySales
              )}
            </h3>

            <p className="mt-2 text-xs text-neutral-400">
              {stats.todayOrders} orders
            </p>
          </div>

          {/* This Week */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-neutral-500">
              This Week
            </p>

            <h3 className="mt-3 text-2xl font-bold text-neutral-900">
              {formatCurrency(
                stats.weeklySales
              )}
            </h3>

            <p className="mt-2 text-xs text-neutral-400">
              {stats.weeklyOrders} orders
            </p>
          </div>

          {/* This Month */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-neutral-500">
              This Month
            </p>

            <h3 className="mt-3 text-2xl font-bold text-neutral-900">
              {formatCurrency(
                stats.monthlySales
              )}
            </h3>

            <p className="mt-2 text-xs text-neutral-400">
              {stats.monthlyOrders} orders
            </p>
          </div>

          {/* This Year */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-neutral-500">
              This Year
            </p>

            <h3 className="mt-3 text-2xl font-bold text-neutral-900">
              {formatCurrency(
                stats.yearlySales
              )}
            </h3>

            <p className="mt-2 text-xs text-neutral-400">
              {stats.yearlyOrders} orders
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          INVENTORY OVERVIEW
      ====================================================== */}

      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-neutral-900">
            Inventory Overview
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Product availability by color, size
            and quantity.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-5 py-4 text-left font-semibold text-neutral-700">
                    Product
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-neutral-700">
                    Color
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-neutral-700">
                    Size
                  </th>

                  <th className="px-5 py-4 text-center font-semibold text-neutral-700">
                    Available
                  </th>

                  <th className="px-5 py-4 text-center font-semibold text-neutral-700">
                    Low Stock At
                  </th>

                  <th className="px-5 py-4 text-center font-semibold text-neutral-700">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {inventory.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-neutral-500"
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  inventory.map((product) => {
                    const status =
                      getStockStatus(
                        product.stock_quantity,
                        product.low_stock_threshold
                      );

                    return (
                      <tr
                        key={product.id}
                        className="border-t transition hover:bg-neutral-50"
                      >
                        <td className="px-5 py-4 font-medium text-neutral-900">
                          {product.name}
                        </td>

                        <td className="px-5 py-4 text-neutral-600">
                          {product.color || "-"}
                        </td>

                        <td className="px-5 py-4 text-neutral-600">
                          {product.size || "-"}
                        </td>

                        <td className="px-5 py-4 text-center font-semibold text-neutral-900">
                          {product.stock_quantity}
                        </td>

                        <td className="px-5 py-4 text-center text-neutral-600">
                          {product.low_stock_threshold}
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}