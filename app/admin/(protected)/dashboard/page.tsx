import { requireSession } from "@/lib/auth/session";
import {
  getDashboardInventory,
  getDashboardStats,
} from "@/lib/services/dashboard.service";

function formatCurrency(value: number) {
  return `৳${value.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function DashboardPage() {
  const session = await requireSession();

  const [stats, inventory] =
    await Promise.all([
      getDashboardStats(),
      getDashboardInventory(),
    ]);

  const lowStockItems =
    inventory.filter(
      (item) =>
        item.stock_quantity <=
        item.low_stock_threshold
    );

  const outOfStockItems =
    inventory.filter(
      (item) =>
        item.stock_quantity === 0
    );

  return (
    <div className="space-y-8">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div>
        <h1 className="text-3xl font-bold text-neutral-950">
          Dashboard
        </h1>

        <p className="mt-2 text-neutral-500">
          Welcome {session.user.email}
        </p>
      </div>

      {/* =====================================================
          OVERVIEW
      ====================================================== */}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Sales */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">
            Total Sales
          </p>

          <p className="mt-3 text-3xl font-bold text-neutral-950">
            {formatCurrency(
              stats.totalRevenue
            )}
          </p>

          <p className="mt-2 text-xs text-neutral-500">
            All non-cancelled orders
          </p>
        </div>

        {/* Total Profit */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">
            Total Profit
          </p>

          <p className="mt-3 text-3xl font-bold text-green-600">
            {formatCurrency(
              stats.yearlyProfit
            )}
          </p>

          <p className="mt-2 text-xs text-neutral-500">
            Current year profit
          </p>
        </div>

        {/* Total Orders */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">
            Total Orders
          </p>

          <p className="mt-3 text-3xl font-bold text-neutral-950">
            {stats.totalOrders.toLocaleString()}
          </p>

          <p className="mt-2 text-xs text-neutral-500">
            All non-cancelled orders
          </p>
        </div>

        {/* Low Stock */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">
            Low Stock
          </p>

          <p className="mt-3 text-3xl font-bold text-amber-600">
            {lowStockItems.length.toLocaleString()}
          </p>

          <p className="mt-2 text-xs text-neutral-500">
            {outOfStockItems.length} out of stock
          </p>
        </div>
      </div>

      {/* =====================================================
          SALES & PROFIT
      ====================================================== */}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-neutral-950">
            Sales & Profit
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Sales and profit performance by period and sales channel.
          </p>
        </div>

        <div className="space-y-6">
          {/* =================================================
              TODAY
          ================================================== */}

          <div>
            <h3 className="mb-3 text-sm font-semibold text-neutral-900">
              Today
            </h3>

            <div className="grid gap-4 md:grid-cols-3">
              {/* Online */}

              <div className="rounded-xl border bg-sky-50 p-5">
                <p className="text-sm font-medium text-sky-700">
                  Online Sales
                </p>

                <p className="mt-2 text-2xl font-bold text-neutral-950">
                  {formatCurrency(
                    stats.todayOnlineSales
                  )}
                </p>

                <div className="mt-4 border-t border-sky-100 pt-3">
                  <p className="text-xs text-neutral-500">
                    Profit
                  </p>

                  <p className="mt-1 text-lg font-semibold text-green-600">
                    {formatCurrency(
                      stats.todayOnlineProfit
                    )}
                  </p>
                </div>
              </div>

              {/* Store */}

              <div className="rounded-xl border bg-amber-50 p-5">
                <p className="text-sm font-medium text-amber-700">
                  Store Sales
                </p>

                <p className="mt-2 text-2xl font-bold text-neutral-950">
                  {formatCurrency(
                    stats.todayStoreSales
                  )}
                </p>

                <div className="mt-4 border-t border-amber-100 pt-3">
                  <p className="text-xs text-neutral-500">
                    Profit
                  </p>

                  <p className="mt-1 text-lg font-semibold text-green-600">
                    {formatCurrency(
                      stats.todayStoreProfit
                    )}
                  </p>
                </div>
              </div>

              {/* Total */}

              <div className="rounded-xl border bg-neutral-50 p-5">
                <p className="text-sm font-medium text-neutral-600">
                  Total
                </p>

                <p className="mt-2 text-2xl font-bold text-neutral-950">
                  {formatCurrency(
                    stats.todaySales
                  )}
                </p>

                <div className="mt-4 border-t pt-3">
                  <p className="text-xs text-neutral-500">
                    Profit
                  </p>

                  <p className="mt-1 text-lg font-semibold text-green-600">
                    {formatCurrency(
                      stats.todayProfit
                    )}
                  </p>

                  <p className="mt-2 text-xs text-neutral-500">
                    {stats.todayOrders} orders
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              THIS WEEK
          ================================================== */}

          <div>
            <h3 className="mb-3 text-sm font-semibold text-neutral-900">
              This Week
            </h3>

            <div className="grid gap-4 md:grid-cols-3">
              {/* Online */}

              <div className="rounded-xl border bg-sky-50 p-5">
                <p className="text-sm font-medium text-sky-700">
                  Online Sales
                </p>

                <p className="mt-2 text-2xl font-bold text-neutral-950">
                  {formatCurrency(
                    stats.weeklyOnlineSales
                  )}
                </p>

                <div className="mt-4 border-t border-sky-100 pt-3">
                  <p className="text-xs text-neutral-500">
                    Profit
                  </p>

                  <p className="mt-1 text-lg font-semibold text-green-600">
                    {formatCurrency(
                      stats.weeklyOnlineProfit
                    )}
                  </p>
                </div>
              </div>

              {/* Store */}

              <div className="rounded-xl border bg-amber-50 p-5">
                <p className="text-sm font-medium text-amber-700">
                  Store Sales
                </p>

                <p className="mt-2 text-2xl font-bold text-neutral-950">
                  {formatCurrency(
                    stats.weeklyStoreSales
                  )}
                </p>

                <div className="mt-4 border-t border-amber-100 pt-3">
                  <p className="text-xs text-neutral-500">
                    Profit
                  </p>

                  <p className="mt-1 text-lg font-semibold text-green-600">
                    {formatCurrency(
                      stats.weeklyStoreProfit
                    )}
                  </p>
                </div>
              </div>

              {/* Total */}

              <div className="rounded-xl border bg-neutral-50 p-5">
                <p className="text-sm font-medium text-neutral-600">
                  Total
                </p>

                <p className="mt-2 text-2xl font-bold text-neutral-950">
                  {formatCurrency(
                    stats.weeklySales
                  )}
                </p>

                <div className="mt-4 border-t pt-3">
                  <p className="text-xs text-neutral-500">
                    Profit
                  </p>

                  <p className="mt-1 text-lg font-semibold text-green-600">
                    {formatCurrency(
                      stats.weeklyProfit
                    )}
                  </p>

                  <p className="mt-2 text-xs text-neutral-500">
                    {stats.weeklyOrders} orders
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              THIS MONTH
          ================================================== */}

          <div>
            <h3 className="mb-3 text-sm font-semibold text-neutral-900">
              This Month
            </h3>

            <div className="grid gap-4 md:grid-cols-3">
              {/* Online */}

              <div className="rounded-xl border bg-sky-50 p-5">
                <p className="text-sm font-medium text-sky-700">
                  Online Sales
                </p>

                <p className="mt-2 text-2xl font-bold text-neutral-950">
                  {formatCurrency(
                    stats.monthlyOnlineSales
                  )}
                </p>

                <div className="mt-4 border-t border-sky-100 pt-3">
                  <p className="text-xs text-neutral-500">
                    Profit
                  </p>

                  <p className="mt-1 text-lg font-semibold text-green-600">
                    {formatCurrency(
                      stats.monthlyOnlineProfit
                    )}
                  </p>
                </div>
              </div>

              {/* Store */}

              <div className="rounded-xl border bg-amber-50 p-5">
                <p className="text-sm font-medium text-amber-700">
                  Store Sales
                </p>

                <p className="mt-2 text-2xl font-bold text-neutral-950">
                  {formatCurrency(
                    stats.monthlyStoreSales
                  )}
                </p>

                <div className="mt-4 border-t border-amber-100 pt-3">
                  <p className="text-xs text-neutral-500">
                    Profit
                  </p>

                  <p className="mt-1 text-lg font-semibold text-green-600">
                    {formatCurrency(
                      stats.monthlyStoreProfit
                    )}
                  </p>
                </div>
              </div>

              {/* Total */}

              <div className="rounded-xl border bg-neutral-50 p-5">
                <p className="text-sm font-medium text-neutral-600">
                  Total
                </p>

                <p className="mt-2 text-2xl font-bold text-neutral-950">
                  {formatCurrency(
                    stats.monthlySales
                  )}
                </p>

                <div className="mt-4 border-t pt-3">
                  <p className="text-xs text-neutral-500">
                    Profit
                  </p>

                  <p className="mt-1 text-lg font-semibold text-green-600">
                    {formatCurrency(
                      stats.monthlyProfit
                    )}
                  </p>

                  <p className="mt-2 text-xs text-neutral-500">
                    {stats.monthlyOrders} orders
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              THIS YEAR
          ================================================== */}

          <div>
            <h3 className="mb-3 text-sm font-semibold text-neutral-900">
              This Year
            </h3>

            <div className="grid gap-4 md:grid-cols-3">
              {/* Online */}

              <div className="rounded-xl border bg-sky-50 p-5">
                <p className="text-sm font-medium text-sky-700">
                  Online Sales
                </p>

                <p className="mt-2 text-2xl font-bold text-neutral-950">
                  {formatCurrency(
                    stats.yearlyOnlineSales
                  )}
                </p>

                <div className="mt-4 border-t border-sky-100 pt-3">
                  <p className="text-xs text-neutral-500">
                    Profit
                  </p>

                  <p className="mt-1 text-lg font-semibold text-green-600">
                    {formatCurrency(
                      stats.yearlyOnlineProfit
                    )}
                  </p>
                </div>
              </div>

              {/* Store */}

              <div className="rounded-xl border bg-amber-50 p-5">
                <p className="text-sm font-medium text-amber-700">
                  Store Sales
                </p>

                <p className="mt-2 text-2xl font-bold text-neutral-950">
                  {formatCurrency(
                    stats.yearlyStoreSales
                  )}
                </p>

                <div className="mt-4 border-t border-amber-100 pt-3">
                  <p className="text-xs text-neutral-500">
                    Profit
                  </p>

                  <p className="mt-1 text-lg font-semibold text-green-600">
                    {formatCurrency(
                      stats.yearlyStoreProfit
                    )}
                  </p>
                </div>
              </div>

              {/* Total */}

              <div className="rounded-xl border bg-neutral-50 p-5">
                <p className="text-sm font-medium text-neutral-600">
                  Total
                </p>

                <p className="mt-2 text-2xl font-bold text-neutral-950">
                  {formatCurrency(
                    stats.yearlySales
                  )}
                </p>

                <div className="mt-4 border-t pt-3">
                  <p className="text-xs text-neutral-500">
                    Profit
                  </p>

                  <p className="mt-1 text-lg font-semibold text-green-600">
                    {formatCurrency(
                      stats.yearlyProfit
                    )}
                  </p>

                  <p className="mt-2 text-xs text-neutral-500">
                    {stats.yearlyOrders} orders
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CURRENT INVENTORY
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-6 py-5">
          <h2 className="text-lg font-semibold text-neutral-950">
            Current Inventory
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Current available quantity by product, color and size.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-neutral-700">
                  Product
                </th>

                <th className="px-6 py-4 text-left font-semibold text-neutral-700">
                  Color
                </th>

                <th className="px-6 py-4 text-left font-semibold text-neutral-700">
                  Size
                </th>

                <th className="px-6 py-4 text-center font-semibold text-neutral-700">
                  Available
                </th>

                <th className="px-6 py-4 text-center font-semibold text-neutral-700">
                  Low Stock At
                </th>

                <th className="px-6 py-4 text-center font-semibold text-neutral-700">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {inventory.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-neutral-500"
                  >
                    No inventory available.
                  </td>
                </tr>
              ) : (
                inventory.map((item) => {
                  const isOutOfStock =
                    item.stock_quantity === 0;

                  const isLowStock =
                    item.stock_quantity <=
                    item.low_stock_threshold;

                  return (
                    <tr
                      key={item.id}
                      className="border-t transition hover:bg-neutral-50"
                    >
                      <td className="px-6 py-4 font-medium text-neutral-900">
                        {item.name}
                      </td>

                      <td className="px-6 py-4 text-neutral-600">
                        {item.color || "-"}
                      </td>

                      <td className="px-6 py-4 text-neutral-600">
                        {item.size || "-"}
                      </td>

                      <td className="px-6 py-4 text-center font-semibold">
                        {item.stock_quantity}
                      </td>

                      <td className="px-6 py-4 text-center text-neutral-600">
                        {item.low_stock_threshold}
                      </td>

                      <td className="px-6 py-4 text-center">
                        {isOutOfStock ? (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                            Low Stock
                          </span>
                        ) : (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}