import Link from "next/link";

import { Container } from "@/components/common/container";
import { Logo } from "@/components/shared/logo";

import { MAIN_NAVIGATION } from "@/config/navigation";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur">

      <Container>

        <div className="flex h-16 items-center justify-between">

          <Logo />

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

        </div>

      </Container>

    </header>
  );
}