"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS } from "./nav-items";
import { LogoutButton } from "./logout-button";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col bg-blue-950 text-white">
      {/* Brand */}
      <div className="border-b border-white/10 px-6 py-6">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-3"
          aria-label="MN Fashion House Admin"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1.5">
            <Image
              src="/images/logo.png"
              alt="MN Fashion House Logo"
              width={44}
              height={44}
              className="h-full w-full object-contain"
              priority
            />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-base font-black uppercase tracking-[0.18em] text-white">
              MN FASHION HOUSE
            </h2>

            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-red-400">
              ADMIN PANEL
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-950/30"
                    : "text-blue-100 hover:bg-blue-900/70 hover:text-white"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                    active
                      ? "bg-white/15 text-white"
                      : "bg-blue-900 text-blue-200 group-hover:bg-blue-800 group-hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                </span>

                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      
      <div className="border-t border-white/10 p-4">
        <div className="rounded-xl bg-white p-1 shadow-lg">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}