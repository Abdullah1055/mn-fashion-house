"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { Container } from "@/components/common/container";
import { Logo } from "@/components/shared/logo";
import { useCart } from "@/components/cart/cart-provider";

import { MAIN_NAVIGATION } from "@/config/navigation";

export function Header() {
  const { itemCount } = useCart();

  return (
    <header className="border-b bg-white">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Logo />

          <div className="flex items-center gap-6">
            <nav className="hidden items-center gap-8 md:flex">
              {MAIN_NAVIGATION.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-neutral-700 transition hover:text-black"
                >
                  {item.title}
                </Link>
              ))}
            </nav>

            <Link
              href="/cart"
              aria-label={`Shopping cart with ${itemCount} items`}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-neutral-700 transition hover:bg-neutral-100 hover:text-black"
            >
              <ShoppingBag size={20} />

              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
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