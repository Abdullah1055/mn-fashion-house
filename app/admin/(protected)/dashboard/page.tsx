import { requireSession } from "@/lib/auth/session";

import {
  getDashboardInventory,
  getDashboardStats,
} from "@/lib/services/dashboard.service";

/* =========================================================
   HELPERS
========================================================= */

function formatCurrency(
  value: number
) {
  return `৳${value.toLocaleString(
    "en-BD",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}

function formatDisplayDate(
  value: string
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(
      `${value}T00:00:00`
    );

  return date.toLocaleDateString(
    "en-BD",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

/* =========================================================
   SEARCH PARAMS
========================================================= */

type DashboardSearchParams = {
  from?: string;
  to?: string;
};

/* =========================================================
   DASHBOARD PAGE
========================================================= */

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const session =
    await requireSession();

  const params =
    await searchParams;

  const fromDate =
    params.from || "";

  const toDate =
    params.to || "";

  const hasCustomRange =
    Boolean(
      fromDate && toDate
    );

  /* =======================================================
     DATA
  ======================================================= */

  const [
    stats,
    inventory,
  ] = await Promise.all([
    getDashboardStats(
      fromDate,
      toDate
    ),
    getDashboardInventory(),
  ]);

  /* =======================================================
     INVENTORY STATUS
  ======================================================= */

  const lowStockItems =
    inventory.filter(
      (item) =>
        item.stock_quantity <=
        item.low_stock_threshold
    );

  const outOfStockItems =
    inventory.filter(
      (item) =>
        item.stock_quantity ===
        0
    );

  return (
    <div className="space-y-5">

      {/* ===================================================
          DASHBOARD HEADER
      ==================================================== */}

      <div>
        <h1 className="text-2xl font-bold text-neutral-950">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-neutral-500">
          Welcome {session.user.email}
        </p>
      </div>

      {/* ===================================================
          OVERVIEW CARDS
      ==================================================== */}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total Sales */}

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">

          <p className="text-xs font-medium text-neutral-500">
            Total Sales
          </p>

          <p className="mt-1 text-2xl font-bold text-neutral-950">
            {formatCurrency(
              stats.totalRevenue
            )}
          </p>

          <p className="mt-1 text-[11px] text-neutral-500">
            All non-cancelled orders
          </p>

        </div>

        {/* Total Profit */}

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">

          <p className="text-xs font-medium text-neutral-500">
            Total Profit
          </p>

          <p className="mt-1 text-2xl font-bold text-green-600">
            {formatCurrency(
              stats.yearlyProfit
            )}
          </p>

          <p className="mt-1 text-[11px] text-neutral-500">
            Current year profit
          </p>

        </div>

        {/* Total Orders */}

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">

          <p className="text-xs font-medium text-neutral-500">
            Total Orders
          </p>

          <p className="mt-1 text-2xl font-bold text-neutral-950">
            {stats.totalOrders.toLocaleString()}
          </p>

          <p className="mt-1 text-[11px] text-neutral-500">
            All non-cancelled orders
          </p>

        </div>

        {/* Low Stock */}

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">

          <p className="text-xs font-medium text-neutral-500">
            Low Stock
          </p>

          <p className="mt-1 text-2xl font-bold text-amber-600">
            {lowStockItems.length.toLocaleString()}
          </p>

          <p className="mt-1 text-[11px] text-neutral-500">
            {outOfStockItems.length}{" "}
            out of stock
          </p>

        </div>

      </div>

      {/* ===================================================
          SALES & PROFIT SECTION
      ==================================================== */}

      <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">

        <div className="mb-4">

          <h2 className="text-base font-semibold text-neutral-950">
            Sales & Profit
          </h2>

          <p className="mt-0.5 text-xs text-neutral-500">
            Review sales and profit by period.
          </p>

        </div>

        {/* =================================================
            DATE FILTER
        ================================================== */}

        <form
          method="GET"
          className="mb-5 rounded-xl border border-neutral-200 bg-neutral-50 p-3"
        >

          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">

            {/* From Date */}

            <div>

              <label
                htmlFor="dashboard-from"
                className="mb-1 block text-xs font-medium text-neutral-600"
              >
                From Date
              </label>

              <input
                id="dashboard-from"
                name="from"
                type="date"
                defaultValue={
                  fromDate
                }
                className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />

            </div>

            {/* To Date */}

            <div>

              <label
                htmlFor="dashboard-to"
                className="mb-1 block text-xs font-medium text-neutral-600"
              >
                To Date
              </label>

              <input
                id="dashboard-to"
                name="to"
                type="date"
                defaultValue={
                  toDate
                }
                className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />

            </div>

            {/* Apply */}

            <button
              type="submit"
              className="h-9 rounded-lg bg-sky-600 px-5 text-sm font-medium text-white transition hover:bg-sky-700"
            >
              Apply
            </button>

            {/* Clear */}

            <a
              href="/admin/dashboard"
              className="flex h-9 items-center justify-center rounded-lg border border-neutral-300 bg-white px-5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Clear
            </a>

          </div>

          {/* Selected Range */}

          {hasCustomRange && (
            <div className="mt-2 text-xs text-neutral-500">

              Showing sales from{" "}

              <span className="font-medium text-neutral-800">
                {formatDisplayDate(
                  fromDate
                )}
              </span>

              {" "}to{" "}

              <span className="font-medium text-neutral-800">
                {formatDisplayDate(
                  toDate
                )}
              </span>

            </div>
          )}

        </form>
                {/* =================================================
            CUSTOM DATE RANGE
        ================================================== */}

        {hasCustomRange ? (
          <div>

            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

              <h3 className="text-sm font-semibold text-neutral-900">
                Custom Date Range
              </h3>

              <p className="text-xs text-neutral-500">
                {formatDisplayDate(
                  fromDate
                )}{" "}
                —{" "}
                {formatDisplayDate(
                  toDate
                )}
              </p>

            </div>

            <div className="grid gap-4 md:grid-cols-3">

              {/* =================================================
                  CUSTOM ONLINE SALES
              ================================================== */}

              <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">

                <p className="text-sm font-medium text-sky-700">
                  Online Sales
                </p>

                <p className="mt-2 text-2xl font-bold text-neutral-950">
                  {formatCurrency(
                    stats.customOnlineSales
                  )}
                </p>

                <div className="mt-3 border-t border-sky-100 pt-3">

                  <p className="text-xs text-neutral-500">
                    Profit
                  </p>

                  <p className="mt-1 text-lg font-semibold text-green-600">
                    {formatCurrency(
                      stats.customOnlineProfit
                    )}
                  </p>

                </div>

              </div>

              {/* =================================================
                  CUSTOM STORE SALES
              ================================================== */}

              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">

                <p className="text-sm font-medium text-amber-700">
                  Store Sales
                </p>

                <p className="mt-2 text-2xl font-bold text-neutral-950">
                  {formatCurrency(
                    stats.customStoreSales
                  )}
                </p>

                <div className="mt-3 border-t border-amber-100 pt-3">

                  <p className="text-xs text-neutral-500">
                    Profit
                  </p>

                  <p className="mt-1 text-lg font-semibold text-green-600">
                    {formatCurrency(
                      stats.customStoreProfit
                    )}
                  </p>

                </div>

              </div>

              {/* =================================================
                  CUSTOM TOTAL
              ================================================== */}

              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">

                <p className="text-sm font-medium text-neutral-600">
                  Total
                </p>

                <p className="mt-2 text-2xl font-bold text-neutral-950">
                  {formatCurrency(
                    stats.customSales
                  )}
                </p>

                <div className="mt-3 border-t border-neutral-200 pt-3">

                  <div className="flex items-center justify-between gap-4">

                    <div>

                      <p className="text-xs text-neutral-500">
                        Profit
                      </p>

                      <p className="mt-1 text-lg font-semibold text-green-600">
                        {formatCurrency(
                          stats.customProfit
                        )}
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="text-xs text-neutral-500">
                        Orders
                      </p>

                      <p className="mt-1 text-sm font-semibold text-neutral-900">
                        {stats.customOrders}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>
        ) : (
          <>
            {/* =================================================
                TODAY
            ================================================== */}

            <div className="mb-5">

              <div className="mb-3 flex items-center justify-between">

                <div>

                  <h3 className="text-sm font-semibold text-neutral-900">
                    Today
                  </h3>

                  <p className="mt-0.5 text-xs text-neutral-500">
                    Today&apos;s sales and profit
                  </p>

                </div>

                <span className="text-xs text-neutral-400">
                  Current Day
                </span>

              </div>

              <div className="grid gap-4 md:grid-cols-3">

                {/* =================================================
                    TODAY ONLINE
                ================================================== */}

                <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">

                  <p className="text-sm font-medium text-sky-700">
                    Online Sales
                  </p>

                  <p className="mt-2 text-2xl font-bold text-neutral-950">
                    {formatCurrency(
                      stats.todayOnlineSales
                    )}
                  </p>

                  <div className="mt-3 border-t border-sky-100 pt-3">

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

                {/* =================================================
                    TODAY STORE
                ================================================== */}

                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">

                  <p className="text-sm font-medium text-amber-700">
                    Store Sales
                  </p>

                  <p className="mt-2 text-2xl font-bold text-neutral-950">
                    {formatCurrency(
                      stats.todayStoreSales
                    )}
                  </p>

                  <div className="mt-3 border-t border-amber-100 pt-3">

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

                {/* =================================================
                    TODAY TOTAL
                ================================================== */}

                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">

                  <p className="text-sm font-medium text-neutral-600">
                    Total
                  </p>

                  <p className="mt-2 text-2xl font-bold text-neutral-950">
                    {formatCurrency(
                      stats.todaySales
                    )}
                  </p>

                  <div className="mt-3 border-t border-neutral-200 pt-3">

                    <div className="flex items-center justify-between gap-4">

                      <div>

                        <p className="text-xs text-neutral-500">
                          Profit
                        </p>

                        <p className="mt-1 text-lg font-semibold text-green-600">
                          {formatCurrency(
                            stats.todayProfit
                          )}
                        </p>

                      </div>

                      <div className="text-right">

                        <p className="text-xs text-neutral-500">
                          Orders
                        </p>

                        <p className="mt-1 text-sm font-semibold text-neutral-900">
                          {stats.todayOrders}
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>
                        {/* =================================================
                LAST 7 DAYS
            ================================================== */}

            <div className="mb-5">

              <div className="mb-3 flex items-center justify-between">

                <div>

                  <h3 className="text-sm font-semibold text-neutral-900">
                    Last 7 Days
                  </h3>

                  <p className="mt-0.5 text-xs text-neutral-500">
                    Today and previous 6 days
                  </p>

                </div>

                <span className="text-xs text-neutral-400">
                  7 Days
                </span>

              </div>

              <div className="grid gap-4 md:grid-cols-3">

                {/* =================================================
                    WEEKLY ONLINE
                ================================================== */}

                <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">

                  <p className="text-sm font-medium text-sky-700">
                    Online Sales
                  </p>

                  <p className="mt-2 text-2xl font-bold text-neutral-950">
                    {formatCurrency(
                      stats.weeklyOnlineSales
                    )}
                  </p>

                  <div className="mt-3 border-t border-sky-100 pt-3">

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

                {/* =================================================
                    WEEKLY STORE
                ================================================== */}

                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">

                  <p className="text-sm font-medium text-amber-700">
                    Store Sales
                  </p>

                  <p className="mt-2 text-2xl font-bold text-neutral-950">
                    {formatCurrency(
                      stats.weeklyStoreSales
                    )}
                  </p>

                  <div className="mt-3 border-t border-amber-100 pt-3">

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

                {/* =================================================
                    WEEKLY TOTAL
                ================================================== */}

                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">

                  <p className="text-sm font-medium text-neutral-600">
                    Total
                  </p>

                  <p className="mt-2 text-2xl font-bold text-neutral-950">
                    {formatCurrency(
                      stats.weeklySales
                    )}
                  </p>

                  <div className="mt-3 border-t border-neutral-200 pt-3">

                    <div className="flex items-center justify-between gap-4">

                      <div>

                        <p className="text-xs text-neutral-500">
                          Profit
                        </p>

                        <p className="mt-1 text-lg font-semibold text-green-600">
                          {formatCurrency(
                            stats.weeklyProfit
                          )}
                        </p>

                      </div>

                      <div className="text-right">

                        <p className="text-xs text-neutral-500">
                          Orders
                        </p>

                        <p className="mt-1 text-sm font-semibold text-neutral-900">
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

            <div className="mb-5">

              <div className="mb-3 flex items-center justify-between">

                <div>

                  <h3 className="text-sm font-semibold text-neutral-900">
                    This Month
                  </h3>

                  <p className="mt-0.5 text-xs text-neutral-500">
                    From the 1st day of this month to today
                  </p>

                </div>

                <span className="text-xs text-neutral-400">
                  Current Month
                </span>

              </div>

              <div className="grid gap-4 md:grid-cols-3">

                {/* =================================================
                    MONTHLY ONLINE
                ================================================== */}

                <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">

                  <p className="text-sm font-medium text-sky-700">
                    Online Sales
                  </p>

                  <p className="mt-2 text-2xl font-bold text-neutral-950">
                    {formatCurrency(
                      stats.monthlyOnlineSales
                    )}
                  </p>

                  <div className="mt-3 border-t border-sky-100 pt-3">

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

                {/* =================================================
                    MONTHLY STORE
                ================================================== */}

                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">

                  <p className="text-sm font-medium text-amber-700">
                    Store Sales
                  </p>

                  <p className="mt-2 text-2xl font-bold text-neutral-950">
                    {formatCurrency(
                      stats.monthlyStoreSales
                    )}
                  </p>

                  <div className="mt-3 border-t border-amber-100 pt-3">

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

                {/* =================================================
                    MONTHLY TOTAL
                ================================================== */}

                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">

                  <p className="text-sm font-medium text-neutral-600">
                    Total
                  </p>

                  <p className="mt-2 text-2xl font-bold text-neutral-950">
                    {formatCurrency(
                      stats.monthlySales
                    )}
                  </p>

                  <div className="mt-3 border-t border-neutral-200 pt-3">

                    <div className="flex items-center justify-between gap-4">

                      <div>

                        <p className="text-xs text-neutral-500">
                          Profit
                        </p>

                        <p className="mt-1 text-lg font-semibold text-green-600">
                          {formatCurrency(
                            stats.monthlyProfit
                          )}
                        </p>

                      </div>

                      <div className="text-right">

                        <p className="text-xs text-neutral-500">
                          Orders
                        </p>

                        <p className="mt-1 text-sm font-semibold text-neutral-900">
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

              <div className="mb-3 flex items-center justify-between">

                <div>

                  <h3 className="text-sm font-semibold text-neutral-900">
                    This Year
                  </h3>

                  <p className="mt-0.5 text-xs text-neutral-500">
                    From January 1st to today
                  </p>

                </div>

                <span className="text-xs text-neutral-400">
                  Current Year
                </span>

              </div>

              <div className="grid gap-4 md:grid-cols-3">

                {/* =================================================
                    YEARLY ONLINE
                ================================================== */}

                <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">

                  <p className="text-sm font-medium text-sky-700">
                    Online Sales
                  </p>

                  <p className="mt-2 text-2xl font-bold text-neutral-950">
                    {formatCurrency(
                      stats.yearlyOnlineSales
                    )}
                  </p>

                  <div className="mt-3 border-t border-sky-100 pt-3">

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

                {/* =================================================
                    YEARLY STORE
                ================================================== */}

                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">

                  <p className="text-sm font-medium text-amber-700">
                    Store Sales
                  </p>

                  <p className="mt-2 text-2xl font-bold text-neutral-950">
                    {formatCurrency(
                      stats.yearlyStoreSales
                    )}
                  </p>

                  <div className="mt-3 border-t border-amber-100 pt-3">

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

                {/* =================================================
                    YEARLY TOTAL
                ================================================== */}

                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">

                  <p className="text-sm font-medium text-neutral-600">
                    Total
                  </p>

                  <p className="mt-2 text-2xl font-bold text-neutral-950">
                    {formatCurrency(
                      stats.yearlySales
                    )}
                  </p>

                  <div className="mt-3 border-t border-neutral-200 pt-3">

                    <div className="flex items-center justify-between gap-4">

                      <div>

                        <p className="text-xs text-neutral-500">
                          Profit
                        </p>

                        <p className="mt-1 text-lg font-semibold text-green-600">
                          {formatCurrency(
                            stats.yearlyProfit
                          )}
                        </p>

                      </div>

                      <div className="text-right">

                        <p className="text-xs text-neutral-500">
                          Orders
                        </p>

                        <p className="mt-1 text-sm font-semibold text-neutral-900">
                          {stats.yearlyOrders}
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </>
        )}

      </section>

      {/* =====================================================
          CURRENT INVENTORY
      ====================================================== */}

      <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">

        <div className="border-b border-neutral-200 px-4 py-3">

          <h2 className="text-base font-semibold text-neutral-950">
            Current Inventory
          </h2>

          <p className="mt-0.5 text-xs text-neutral-500">
            Current available quantity by product, color and size.
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px] text-sm">

            <thead className="bg-neutral-50">

              <tr>

                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600">
                  Product
                </th>

                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600">
                  Color
                </th>

                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600">
                  Size
                </th>

                <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-neutral-600">
                  Available
                </th>

                <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-neutral-600">
                  Low Stock At
                </th>

                <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-neutral-600">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {inventory.length === 0 ? (
                <tr>

                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-neutral-500"
                  >
                    No inventory available.
                  </td>

                </tr>
              ) : (
                inventory.map(
                  (item) => {

                    const isOutOfStock =
                      item.stock_quantity ===
                      0;

                    const isLowStock =
                      item.stock_quantity <=
                      item.low_stock_threshold;

                    return (
                      <tr
                        key={item.id}
                        className="border-t border-neutral-100 transition hover:bg-neutral-50"
                      >

                        <td className="px-4 py-2.5 font-medium text-neutral-900">
                          {item.name}
                        </td>

                        <td className="px-4 py-2.5 text-neutral-600">
                          {item.color ||
                            "-"}
                        </td>

                        <td className="px-4 py-2.5 text-neutral-600">
                          {item.size ||
                            "-"}
                        </td>

                        <td className="px-4 py-2.5 text-center font-semibold text-neutral-900">
                          {
                            item.stock_quantity
                          }
                        </td>

                        <td className="px-4 py-2.5 text-center text-neutral-600">
                          {
                            item.low_stock_threshold
                          }
                        </td>

                        <td className="px-4 py-2.5 text-center">

                          {isOutOfStock ? (
                            <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-medium text-red-700">
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                              Low Stock
                            </span>
                          ) : (
                            <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-medium text-green-700">
                              In Stock
                            </span>
                          )}

                        </td>

                      </tr>
                    );
                  }
                )
              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}