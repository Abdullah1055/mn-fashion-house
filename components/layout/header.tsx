"use client";

import Link from "next/link";
import {
  Search,
  ShoppingBag,
} from "lucide-react";

import { Container } from "@/components/common/container";
import { useCart } from "@/components/cart/cart-provider";

import { MAIN_NAVIGATION } from "@/config/navigation";

export function Header() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-sky-100 bg-white/95 backdrop-blur">
      <Container>
        <div className="flex h-20 items-center justify-between gap-6">
          {/* Brand */}
          <Link
            href="/"
            className="shrink-0"
            aria-label="MN Fashion House Home"
          >
            <span className="text-xl font-extrabold uppercase tracking-tight text-red-600 sm:text-2xl">
              MN FASHION HOUSE
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-7 md:flex">
            {MAIN_NAVIGATION.map(
              (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative py-7 text-sm font-semibold uppercase text-slate-700 transition hover:text-red-600"
                >
                  {item.title}

                  <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-red-600 transition-all duration-200 group-hover:w-full" />
                </Link>
              )
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Link
              href="/products"
              aria-label="Search products"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <Search size={19} />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              aria-label={`Shopping cart with ${itemCount} items`}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <ShoppingBag size={20} />

              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {itemCount > 99
                    ? "99+"
                    : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
}