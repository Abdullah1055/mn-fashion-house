"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS } from "./nav-items";

import { LogoutButton } from "./logout-button";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-72 flex-col border-r bg-white">
      <div className="border-b p-6">
        <h2 className="text-2xl font-bold">
          MN Fashion
        </h2>

        <p className="text-sm text-neutral-500">
          Admin Panel
        </p>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                  active
                    ? "bg-sky-600 text-white"
                    : "hover:bg-neutral-100"
                }`}
              >
                <Icon size={18} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="border-t p-4">
  <LogoutButton />
</div>
    </aside>
  );
}