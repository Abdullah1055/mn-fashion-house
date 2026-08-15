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
    <div className="space-y-5">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div>
        <h1 className="text-2xl font-bold text-neutral-950">
          Dashboard
        </h1>

        <p className="mt-0.5 text-sm text-neutral-500">
          Welcome {session.user.email}
        </p>
      </div>

      {/* =====================================================
          OVERVIEW
      ====================================================== */}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total Sales */}

        <div className="rounded-xl border bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium text-neutral-500">
            Total Sales
          </p>

          <p className="mt-1 text-2xl font-bold leading-tight text-neutral-950">
            {formatCurrency(
              stats.totalRevenue
            )}
          </p>

          <p className="mt-1 text-[11px] text-neutral-500">
            All non-cancelled orders
          </p>
        </div>

        {/* Total Profit */}

        <div className="rounded-xl border bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium text-neutral-500">
            Total Profit
          </p>

          <p className="mt-1 text-2xl font-bold leading-tight text-green-600">
            {formatCurrency(
              stats.yearlyProfit
            )}
          </p>

          <p className="mt-1 text-[11px] text-neutral-500">
            Current year profit
          </p>
        </div>

        {/* Total Orders */}

        <div className="rounded-xl border bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium text-neutral-500">
            Total Orders
          </p>

          <p className="mt-1 text-2xl font-bold leading-tight text-neutral-950">
            {stats.totalOrders.toLocaleString()}
          </p>

          <p className="mt-1 text-[11px] text-neutral-500">
            All non-cancelled orders
          </p>
        </div>

        {/* Low Stock */}

        <div className="rounded-xl border bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium text-neutral-500">
            Low Stock
          </p>

          <p className="mt-1 text-2xl font-bold leading-tight text-amber-600">
            {lowStockItems.length.toLocaleString()}
          </p>

          <p className="mt-1 text-[11px] text-neutral-500">
            {outOfStockItems.length} out of stock
          </p>
        </div>
      </div>

      {/* =====================================================
          SALES & PROFIT
      ====================================================== */}

      <section className="rounded-xl border bg-white p-4 shadow-sm">

        {/* Section Header */}

        <div className="mb-1">
          <h2 className="text-base font-semibold text-neutral-950">
            Sales & Profit
          </h2>
        </div>

        <div className="space-y-4">

          {/* =================================================
              TODAY
          ================================================== */}

          <div>
            <h3 className="mb-2 text-xs font-semibold text-neutral-900">
              Today
            </h3>

            <div className="grid gap-3 md:grid-cols-3">

              {/* Online */}

              <div className="rounded-lg border bg-sky-50 px-4 py-3">
                <p className="text-xs font-medium text-sky-700">
                  Online Sales
                </p>

                <p className="mt-1 text-xl font-bold leading-tight text-neutral-950">
                  {formatCurrency(
                    stats.todayOnlineSales
                  )}
                </p>

                <div className="mt-2 border-t border-sky-100 pt-2">
                  <p className="text-[11px] text-neutral-500">
                    Profit
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-green-600">
                    {formatCurrency(
                      stats.todayOnlineProfit
                    )}
                  </p>
                </div>
              </div>

              {/* Store */}

              <div className="rounded-lg border bg-amber-50 px-4 py-3">
                <p className="text-xs font-medium text-amber-700">
                  Store Sales
                </p>

                <p className="mt-1 text-xl font-bold leading-tight text-neutral-950">
                  {formatCurrency(
                    stats.todayStoreSales
                  )}
                </p>

                <div className="mt-2 border-t border-amber-100 pt-2">
                  <p className="text-[11px] text-neutral-500">
                    Profit
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-green-600">
                    {formatCurrency(
                      stats.todayStoreProfit
                    )}
                  </p>
                </div>
              </div>

              {/* Total */}

              <div className="rounded-lg border bg-neutral-50 px-4 py-3">
                <p className="text-xs font-medium text-neutral-600">
                  Total
                </p>

                <p className="mt-1 text-xl font-bold leading-tight text-neutral-950">
                  {formatCurrency(
                    stats.todaySales
                  )}
                </p>

                <div className="mt-2 border-t pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-neutral-500">
                        Profit
                      </p>

                      <p className="mt-0.5 text-sm font-semibold text-green-600">
                        {formatCurrency(
                          stats.todayProfit
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[11px] text-neutral-500">
                        Orders
                      </p>

                      <p className="mt-0.5 text-sm font-semibold text-neutral-900">
                        {stats.todayOrders}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              THIS WEEK
          ================================================== */}

          <div>
            <h3 className="mb-2 text-xs font-semibold text-neutral-900">
              This Week
            </h3>

            <div className="grid gap-3 md:grid-cols-3">

              {/* Online */}

              <div className="rounded-lg border bg-sky-50 px-4 py-3">
                <p className="text-xs font-medium text-sky-700">
                  Online Sales
                </p>

                <p className="mt-1 text-xl font-bold leading-tight text-neutral-950">
                  {formatCurrency(
                    stats.weeklyOnlineSales
                  )}
                </p>

                <div className="mt-2 border-t border-sky-100 pt-2">
                  <p className="text-[11px] text-neutral-500">
                    Profit
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-green-600">
                    {formatCurrency(
                      stats.weeklyOnlineProfit
                    )}
                  </p>
                </div>
              </div>

              {/* Store */}

              <div className="rounded-lg border bg-amber-50 px-4 py-3">
                <p className="text-xs font-medium text-amber-700">
                  Store Sales
                </p>

                <p className="mt-1 text-xl font-bold leading-tight text-neutral-950">
                  {formatCurrency(
                    stats.weeklyStoreSales
                  )}
                </p>

                <div className="mt-2 border-t border-amber-100 pt-2">
                  <p className="text-[11px] text-neutral-500">
                    Profit
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-green-600">
                    {formatCurrency(
                      stats.weeklyStoreProfit
                    )}
                  </p>
                </div>
              </div>

              {/* Total */}

              <div className="rounded-lg border bg-neutral-50 px-4 py-3">
                <p className="text-xs font-medium text-neutral-600">
                  Total
                </p>

                <p className="mt-1 text-xl font-bold leading-tight text-neutral-950">
                  {formatCurrency(
                    stats.weeklySales
                  )}
                </p>

                <div className="mt-2 border-t pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-neutral-500">
                        Profit
                      </p>

                      <p className="mt-0.5 text-sm font-semibold text-green-600">
                        {formatCurrency(
                          stats.weeklyProfit
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[11px] text-neutral-500">
                        Orders
                      </p>

                      <p className="mt-0.5 text-sm font-semibold text-neutral-900">
                        {stats.weeklyOrders}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              THIS MONTH
          ================================================== */}

          <div>
            <h3 className="mb-2 text-xs font-semibold text-neutral-900">
              This Month
            </h3>

            <div className="grid gap-3 md:grid-cols-3">

              {/* Online */}

              <div className="rounded-lg border bg-sky-50 px-4 py-3">
                <p className="text-xs font-medium text-sky-700">
                  Online Sales
                </p>

                <p className="mt-1 text-xl font-bold leading-tight text-neutral-950">
                  {formatCurrency(
                    stats.monthlyOnlineSales
                  )}
                </p>

                <div className="mt-2 border-t border-sky-100 pt-2">
                  <p className="text-[11px] text-neutral-500">
                    Profit
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-green-600">
                    {formatCurrency(
                      stats.monthlyOnlineProfit
                    )}
                  </p>
                </div>
              </div>

              {/* Store */}

              <div className="rounded-lg border bg-amber-50 px-4 py-3">
                <p className="text-xs font-medium text-amber-700">
                  Store Sales
                </p>

                <p className="mt-1 text-xl font-bold leading-tight text-neutral-950">
                  {formatCurrency(
                    stats.monthlyStoreSales
                  )}
                </p>

                <div className="mt-2 border-t border-amber-100 pt-2">
                  <p className="text-[11px] text-neutral-500">
                    Profit
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-green-600">
                    {formatCurrency(
                      stats.monthlyStoreProfit
                    )}
                  </p>
                </div>
              </div>

              {/* Total */}

              <div className="rounded-lg border bg-neutral-50 px-4 py-3">
                <p className="text-xs font-medium text-neutral-600">
                  Total
                </p>

                <p className="mt-1 text-xl font-bold leading-tight text-neutral-950">
                  {formatCurrency(
                    stats.monthlySales
                  )}
                </p>

                <div className="mt-2 border-t pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-neutral-500">
                        Profit
                      </p>

                      <p className="mt-0.5 text-sm font-semibold text-green-600">
                        {formatCurrency(
                          stats.monthlyProfit
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[11px] text-neutral-500">
                        Orders
                      </p>

                      <p className="mt-0.5 text-sm font-semibold text-neutral-900">
                        {stats.monthlyOrders}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              THIS YEAR
          ================================================== */}

          <div>
            <h3 className="mb-2 text-xs font-semibold text-neutral-900">
              This Year
            </h3>

            <div className="grid gap-3 md:grid-cols-3">

              {/* Online */}

              <div className="rounded-lg border bg-sky-50 px-4 py-3">
                <p className="text-xs font-medium text-sky-700">
                  Online Sales
                </p>

                <p className="mt-1 text-xl font-bold leading-tight text-neutral-950">
                  {formatCurrency(
                    stats.yearlyOnlineSales
                  )}
                </p>

                <div className="mt-2 border-t border-sky-100 pt-2">
                  <p className="text-[11px] text-neutral-500">
                    Profit
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-green-600">
                    {formatCurrency(
                      stats.yearlyOnlineProfit
                    )}
                  </p>
                </div>
              </div>

              {/* Store */}

              <div className="rounded-lg border bg-amber-50 px-4 py-3">
                <p className="text-xs font-medium text-amber-700">
                  Store Sales
                </p>

                <p className="mt-1 text-xl font-bold leading-tight text-neutral-950">
                  {formatCurrency(
                    stats.yearlyStoreSales
                  )}
                </p>

                <div className="mt-2 border-t border-amber-100 pt-2">
                  <p className="text-[11px] text-neutral-500">
                    Profit
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-green-600">
                    {formatCurrency(
                      stats.yearlyStoreProfit
                    )}
                  </p>
                </div>
              </div>

              {/* Total */}

              <div className="rounded-lg border bg-neutral-50 px-4 py-3">
                <p className="text-xs font-medium text-neutral-600">
                  Total
                </p>

                <p className="mt-1 text-xl font-bold leading-tight text-neutral-950">
                  {formatCurrency(
                    stats.yearlySales
                  )}
                </p>

                <div className="mt-2 border-t pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-neutral-500">
                        Profit
                      </p>

                      <p className="mt-0.5 text-sm font-semibold text-green-600">
                        {formatCurrency(
                          stats.yearlyProfit
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[11px] text-neutral-500">
                        Orders
                      </p>

                      <p className="mt-0.5 text-sm font-semibold text-neutral-900">
                        {stats.yearlyOrders}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =====================================================
          CURRENT INVENTORY
      ====================================================== */}

      <section className="overflow-hidden rounded-xl border bg-white shadow-sm">

        <div className="border-b px-4 py-3">
          <h2 className="text-base font-semibold text-neutral-950">
            Current Inventory
          </h2>

          <p className="mt-0.5 text-xs text-neutral-500">
            Current available quantity by product, color and size.
          </p>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[750px] text-xs">

            <thead className="bg-neutral-50">

              <tr>

                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-600">
                  Product
                </th>

                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-600">
                  Color
                </th>

                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-600">
                  Size
                </th>

                <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-neutral-600">
                  Available
                </th>

                <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-neutral-600">
                  Low Stock At
                </th>

                <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-neutral-600">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {inventory.length === 0 ? (

                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-neutral-500"
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

                      <td className="px-4 py-2.5 font-medium text-neutral-900">
                        {item.name}
                      </td>

                      <td className="px-4 py-2.5 text-neutral-600">
                        {item.color || "-"}
                      </td>

                      <td className="px-4 py-2.5 text-neutral-600">
                        {item.size || "-"}
                      </td>

                      <td className="px-4 py-2.5 text-center font-semibold text-neutral-900">
                        {item.stock_quantity}
                      </td>

                      <td className="px-4 py-2.5 text-center text-neutral-600">
                        {item.low_stock_threshold}
                      </td>

                      <td className="px-4 py-2.5 text-center">

                        {isOutOfStock ? (

                          <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-medium text-red-700">
                            Out of Stock
                          </span>

                        ) : isLowStock ? (

                          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-medium text-amber-700">
                            Low Stock
                          </span>

                        ) : (

                          <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-medium text-green-700">
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