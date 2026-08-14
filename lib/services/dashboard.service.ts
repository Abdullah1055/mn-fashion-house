import { createClient } from "@/lib/supabase/server";

export type DashboardStats = {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalRevenue: number;

  todaySales: number;
  todayProfit: number;
  todayOrders: number;

  weeklySales: number;
  weeklyProfit: number;
  weeklyOrders: number;

  monthlySales: number;
  monthlyProfit: number;
  monthlyOrders: number;

  yearlySales: number;
  yearlyProfit: number;
  yearlyOrders: number;
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
};

type DashboardOrderItem = {
  order_id: string;
  quantity: number;
  line_total: number;
  purchase_cost: number | null;
};

function getStartOfDay(date: Date) {
  const start = new Date(date);

  start.setHours(0, 0, 0, 0);

  return start;
}

function getStartOfWeek(date: Date) {
  const start = getStartOfDay(date);

  const day = start.getDay();

  const diff =
    day === 0 ? 6 : day - 1;

  start.setDate(
    start.getDate() - diff
  );

  return start;
}

function getStartOfMonth(date: Date) {
  const start = getStartOfDay(date);

  start.setDate(1);

  return start;
}

function getStartOfYear(date: Date) {
  const start = getStartOfDay(date);

  start.setMonth(0, 1);

  return start;
}

function getOrderSales(
  order: DashboardOrder
) {
  return (
    Number(order.subtotal || 0) -
    Number(order.discount_amount || 0)
  );
}

function getOrderCost(
  orderId: string,
  orderItems: DashboardOrderItem[]
) {
  return orderItems
    .filter(
      (item) =>
        item.order_id === orderId
    )
    .reduce(
      (total, item) =>
        total +
        Number(item.purchase_cost || 0) *
          Number(item.quantity || 0),
      0
    );
}

function calculatePeriodTotals(
  orders: DashboardOrder[],
  orderItems: DashboardOrderItem[],
  startDate: Date
) {
  const startTime =
    startDate.getTime();

  const filteredOrders =
    orders.filter(
      (order) =>
        order.order_status !==
          "cancelled" &&
        new Date(
          order.created_at
        ).getTime() >= startTime
    );

  const sales =
    filteredOrders.reduce(
      (total, order) =>
        total +
        getOrderSales(order),
      0
    );

  const profit =
    filteredOrders.reduce(
      (total, order) =>
        total +
        getOrderSales(order) -
        getOrderCost(
          order.id,
          orderItems
        ),
      0
    );

  return {
    sales,
    profit,
    orders:
      filteredOrders.length,
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
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
          order_status
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

  const today =
    calculatePeriodTotals(
      orders,
      orderItems,
      getStartOfDay(now)
    );

  const week =
    calculatePeriodTotals(
      orders,
      orderItems,
      getStartOfWeek(now)
    );

  const month =
    calculatePeriodTotals(
      orders,
      orderItems,
      getStartOfMonth(now)
    );

  const year =
    calculatePeriodTotals(
      orders,
      orderItems,
      getStartOfYear(now)
    );

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

    weeklySales:
      week.sales,

    weeklyProfit:
      week.profit,

    weeklyOrders:
      week.orders,

    monthlySales:
      month.sales,

    monthlyProfit:
      month.profit,

    monthlyOrders:
      month.orders,

    yearlySales:
      year.sales,

    yearlyProfit:
      year.profit,

    yearlyOrders:
      year.orders,
  };
}

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