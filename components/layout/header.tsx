"use client";

import Link from "next/link";
import { Search, ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";

import { Container } from "@/components/common/container";
import { useCart } from "@/components/cart/cart-provider";
import { Logo } from "@/components/shared/logo";
import { MAIN_NAVIGATION } from "@/config/navigation";

export function Header() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  const isActiveRoute = (href: string) => {
    // Homepage should only be active on exact "/"
    if (href === "/") {
      return pathname === "/";
    }

    // Exact route or any nested route
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-sky-100 bg-white/95 backdrop-blur">
      <Container>
        <div className="flex h-15 items-center justify-between gap-6">
          
          {/* Brand */}
          <Link
            href="/"
            className="shrink-0"
            aria-label="MN Fashion House Home"
          >
            <div className="flex flex-col">
              <Logo />

              <p className="ml-[110px] text-[11px] font-bold uppercase tracking-[0.15em] text-red-600">
                Your Confidence, Our Commitment.
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-7 md:flex">
            {MAIN_NAVIGATION.map((item) => {
              const isActive = isActiveRoute(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative py-7 text-sm font-semibold uppercase transition ${
                    isActive
                      ? "text-red-600"
                      : "text-slate-600 hover:text-red-600"
                  }`}
                >
                  {item.title}

                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-red-600 transition-all duration-200 ${
                      isActive
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
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
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50"
            >
              <ShoppingBag size={20} />

              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

          </div>
        </div>
      </Container>
    </header>
  );
}