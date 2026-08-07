"use client";

import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/products": "Products",
  "/admin/products/new": "Add Product",
  "/admin/categories": "Categories",
  "/admin/orders": "Orders",
  "/admin/offers": "Offers",
  "/admin/settings": "Settings",
};

export function AdminHeader() {
  const pathname = usePathname();

  const title = titles[pathname] ?? "Admin";

  return (
    <header className="flex h-20 items-center justify-between border-b bg-white px-8">

      <div>

        <h1 className="text-2xl font-bold">
          {title}
        </h1>

        <p className="text-sm text-neutral-500">
          MN Fashion House Administration
        </p>

      </div>

      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-600 font-semibold text-white">
        A
      </div>

    </header>
  );
}