import {
  LayoutDashboard,
  Package,
  Grid3X3,
  Tags,
  ShoppingCart,
  BadgePercent,
  Settings,
  Store,
  ListTree,
} from "lucide-react";

export const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },

  {
    title: "Store Selling",
    href: "/admin/store-selling",
    icon: Store,
  },

  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },

  {
    title: "Main Categories",
    href: "/admin/main-categories",
    icon: ListTree,
  },

  {
    title: "Brands",
    href: "/admin/brands",
    icon: Tags,
  },

  {
    title: "Categories",
    href: "/admin/categories",
    icon: Grid3X3,
  },

  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
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