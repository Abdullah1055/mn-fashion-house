import {
  LayoutDashboard,
  Package,
  Grid3X3,
  ShoppingCart,
  BadgePercent,
  Settings,
} from "lucide-react";

export const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: Grid3X3,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Offers",
    href: "/admin/offers",
    icon: BadgePercent,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];