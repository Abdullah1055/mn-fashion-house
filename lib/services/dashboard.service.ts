import { createClient } from "@/lib/supabase/server";

export type DashboardStats = {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalRevenue: number;

  todaySales: number;
  todayProfit: number;
  todayOrders: number;
  todayOnlineSales: number;
  todayStoreSales: number;
  todayOnlineProfit: number;
  todayStoreProfit: number;

  weeklySales: number;
  weeklyProfit: number;
  weeklyOrders: number;
  weeklyOnlineSales: number;
  weeklyStoreSales: number;
  weeklyOnlineProfit: number;
  weeklyStoreProfit: number;

  monthlySales: number;
  monthlyProfit: number;
  monthlyOrders: number;
  monthlyOnlineSales: number;
  monthlyStoreSales: number;
  monthlyOnlineProfit: number;
  monthlyStoreProfit: number;

  yearlySales: number;
  yearlyProfit: number;
  yearlyOrders: number;
  yearlyOnlineSales: number;
  yearlyStoreSales: number;
  yearlyOnlineProfit: number;
  yearlyStoreProfit: number;

  customSales: number;
  customProfit: number;
  customOrders: number;
  customOnlineSales: number;
  customStoreSales: number;
  customOnlineProfit: number;
  customStoreProfit: number;
};

export type DashboardInventoryItem = {
  id: string;
  name: string;
  color: string | null;
  size: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
};

type DashboardOrder = {
  id: string;
  subtotal: number;
  discount_amount: number;
  created_at: string;
  order_status: string;
  order_source: "online" | "store";
};

type DashboardOrderItem = {
  order_id: string;
  quantity: number;
  line_total: number;
  purchase_cost: number | null;
};

type PeriodTotals = {
  sales: number;
  profit: number;
  orders: number;
  onlineSales: number;
  storeSales: number;
  onlineProfit: number;
  storeProfit: number;
};

/* =========================================================
   DATE HELPERS
========================================================= */

function getDhakaDateParts(
  date = new Date()
) {
  const formatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Dhaka",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    );

  const parts =
    formatter.formatToParts(date);

  const year = Number(
    parts.find(
      (part) =>
        part.type === "year"
    )?.value
  );

  const month = Number(
    parts.find(
      (part) =>
        part.type === "month"
    )?.value
  );

  const day = Number(
    parts.find(
      (part) =>
        part.type === "day"
    )?.value
  );

  return {
    year,
    month,
    day,
  };
}

function createDhakaDate(
  year: number,
  month: number,
  day: number
) {
  return new Date(
    `${year}-${String(month).padStart(
      2,
      "0"
    )}-${String(day).padStart(
      2,
      "0"
    )}T00:00:00+06:00`
  );
}

function addDays(
  date: Date,
  days: number
) {
  return new Date(
    date.getTime() +
      days * 24 * 60 * 60 * 1000
  );
}

function getStartOfDay(
  date: Date
) {
  const parts =
    getDhakaDateParts(date);

  return createDhakaDate(
    parts.year,
    parts.month,
    parts.day
  );
}

/*
 * Last 7 days including today.
 *
 * Example:
 * Today = 16 August
 * Range = 10 August → 16 August
 */
function getStartOfWeek(
  date: Date
) {
  return addDays(
    getStartOfDay(date),
    -6
  );
}

function getStartOfMonth(
  date: Date
) {
  const parts =
    getDhakaDateParts(date);

  return createDhakaDate(
    parts.year,
    parts.month,
    1
  );
}

function getStartOfYear(
  date: Date
) {
  const parts =
    getDhakaDateParts(date);

  return createDhakaDate(
    parts.year,
    1,
    1
  );
}

function getEndExclusiveOfDay(
  date: Date
) {
  return addDays(
    getStartOfDay(date),
    1
  );
}

/* =========================================================
   CUSTOM DATE PARSING
========================================================= */

function parseCustomDate(
  value?: string
) {
  if (!value) {
    return null;
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    return null;
  }

  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  const date =
    createDhakaDate(
      year,
      month,
      day
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}

/* =========================================================
   ORDER CALCULATIONS
========================================================= */

function getOrderSales(
  order: DashboardOrder
) {
  return (
    Number(order.subtotal || 0) -
    Number(
      order.discount_amount || 0
    )
  );
}

function getOrderCost(
  orderId: string,
  orderItems: DashboardOrderItem[]
) {
  return orderItems
    .filter(
      (item) =>
        item.order_id ===
        orderId
    )
    .reduce(
      (total, item) =>
        total +
        Number(
          item.purchase_cost || 0
        ) *
          Number(
            item.quantity || 0
          ),
      0
    );
}

function getOrderProfit(
  order: DashboardOrder,
  orderItems: DashboardOrderItem[]
) {
  return (
    getOrderSales(order) -
    getOrderCost(
      order.id,
      orderItems
    )
  );
}

/* =========================================================
   PERIOD TOTALS
========================================================= */

function calculatePeriodTotals(
  orders: DashboardOrder[],
  orderItems: DashboardOrderItem[],
  startDate: Date,
  endDate?: Date
): PeriodTotals {
  const startTime =
    startDate.getTime();

  const endTime =
    endDate?.getTime();

  const filteredOrders =
    orders.filter((order) => {
      if (
        order.order_status ===
        "cancelled"
      ) {
        return false;
      }

      const orderTime =
        new Date(
          order.created_at
        ).getTime();

      if (
        orderTime < startTime
      ) {
        return false;
      }

      if (
        endTime !== undefined &&
        orderTime >= endTime
      ) {
        return false;
      }

      return true;
    });

  let sales = 0;
  let profit = 0;

  let onlineSales = 0;
  let storeSales = 0;

  let onlineProfit = 0;
  let storeProfit = 0;

  for (
    const order of filteredOrders
  ) {
    const orderSales =
      getOrderSales(order);

    const orderProfit =
      getOrderProfit(
        order,
        orderItems
      );

    sales += orderSales;
    profit += orderProfit;

    if (
      order.order_source ===
      "store"
    ) {
      storeSales += orderSales;
      storeProfit += orderProfit;
    } else {
      onlineSales += orderSales;
      onlineProfit += orderProfit;
    }
  }

  return {
    sales,
    profit,
    orders:
      filteredOrders.length,
    onlineSales,
    storeSales,
    onlineProfit,
    storeProfit,
  };
}

/* =========================================================
   DASHBOARD STATS
========================================================= */

export async function getDashboardStats(
  customFrom?: string,
  customTo?: string
): Promise<DashboardStats> {
  const supabase =
    await createClient();

  const [
    productsResult,
    categoriesResult,
    ordersResult,
    orderItemsResult,
  ] = await Promise.all([
    supabase
      .from("products")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("categories")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("orders")
      .select(
        `
          id,
          subtotal,
          discount_amount,
          created_at,
          order_status,
          order_source
        `
      ),

    supabase
      .from("order_items")
      .select(
        `
          order_id,
          quantity,
          line_total,
          purchase_cost
        `
      ),
  ]);

  if (productsResult.error) {
    throw productsResult.error;
  }

  if (categoriesResult.error) {
    throw categoriesResult.error;
  }

  if (ordersResult.error) {
    throw ordersResult.error;
  }

  if (orderItemsResult.error) {
    throw orderItemsResult.error;
  }

  const orders =
    (ordersResult.data ??
      []) as DashboardOrder[];

  const orderItems =
    (orderItemsResult.data ??
      []) as DashboardOrderItem[];

  const now = new Date();

  /* =======================================================
     TODAY
  ======================================================= */

  const today =
    calculatePeriodTotals(
      orders,
      orderItems,
      getStartOfDay(now),
      getEndExclusiveOfDay(now)
    );

  /* =======================================================
     LAST 7 DAYS
  ======================================================= */

  const week =
    calculatePeriodTotals(
      orders,
      orderItems,
      getStartOfWeek(now),
      getEndExclusiveOfDay(now)
    );

  /* =======================================================
     THIS MONTH
  ======================================================= */

  const month =
    calculatePeriodTotals(
      orders,
      orderItems,
      getStartOfMonth(now),
      getEndExclusiveOfDay(now)
    );

  /* =======================================================
     THIS YEAR
  ======================================================= */

  const year =
    calculatePeriodTotals(
      orders,
      orderItems,
      getStartOfYear(now),
      getEndExclusiveOfDay(now)
    );

  /* =======================================================
     CUSTOM DATE RANGE
  ======================================================= */

  let custom: PeriodTotals = {
    sales: 0,
    profit: 0,
    orders: 0,
    onlineSales: 0,
    storeSales: 0,
    onlineProfit: 0,
    storeProfit: 0,
  };

  const parsedFrom =
    parseCustomDate(
      customFrom
    );

  const parsedTo =
    parseCustomDate(
      customTo
    );

  if (
    parsedFrom &&
    parsedTo &&
    parsedFrom.getTime() <=
      parsedTo.getTime()
  ) {
    custom =
      calculatePeriodTotals(
        orders,
        orderItems,
        parsedFrom,
        getEndExclusiveOfDay(
          parsedTo
        )
      );
  }

  /* =======================================================
     LIFETIME TOTALS
  ======================================================= */

  const validOrders =
    orders.filter(
      (order) =>
        order.order_status !==
        "cancelled"
    );

  const totalRevenue =
    validOrders.reduce(
      (total, order) =>
        total +
        getOrderSales(order),
      0
    );

  const totalOrders =
    validOrders.length;

  return {
    totalProducts:
      productsResult.count ?? 0,

    totalCategories:
      categoriesResult.count ?? 0,

    totalOrders,

    totalRevenue,

    todaySales:
      today.sales,

    todayProfit:
      today.profit,

    todayOrders:
      today.orders,

    todayOnlineSales:
      today.onlineSales,

    todayStoreSales:
      today.storeSales,

    todayOnlineProfit:
      today.onlineProfit,

    todayStoreProfit:
      today.storeProfit,

    weeklySales:
      week.sales,

    weeklyProfit:
      week.profit,

    weeklyOrders:
      week.orders,

    weeklyOnlineSales:
      week.onlineSales,

    weeklyStoreSales:
      week.storeSales,

    weeklyOnlineProfit:
      week.onlineProfit,

    weeklyStoreProfit:
      week.storeProfit,

    monthlySales:
      month.sales,

    monthlyProfit:
      month.profit,

    monthlyOrders:
      month.orders,

    monthlyOnlineSales:
      month.onlineSales,

    monthlyStoreSales:
      month.storeSales,

    monthlyOnlineProfit:
      month.onlineProfit,

    monthlyStoreProfit:
      month.storeProfit,

    yearlySales:
      year.sales,

    yearlyProfit:
      year.profit,

    yearlyOrders:
      year.orders,

    yearlyOnlineSales:
      year.onlineSales,

    yearlyStoreSales:
      year.storeSales,

    yearlyOnlineProfit:
      year.onlineProfit,

    yearlyStoreProfit:
      year.storeProfit,

    customSales:
      custom.sales,

    customProfit:
      custom.profit,

    customOrders:
      custom.orders,

    customOnlineSales:
      custom.onlineSales,

    customStoreSales:
      custom.storeSales,

    customOnlineProfit:
      custom.onlineProfit,

    customStoreProfit:
      custom.storeProfit,
  };
}

/* =========================================================
   INVENTORY
========================================================= */

export async function getDashboardInventory(): Promise<
  DashboardInventoryItem[]
> {
  const supabase =
    await createClient();

  const { data, error } =
    await supabase
      .from("products")
      .select(
        `
          id,
          name,
          color,
          size,
          stock_quantity,
          low_stock_threshold
        `
      )
      .order(
        "stock_quantity",
        {
          ascending: true,
        }
      );

  if (error) {
    throw error;
  }

  return (data ??
    []) as DashboardInventoryItem[];
}