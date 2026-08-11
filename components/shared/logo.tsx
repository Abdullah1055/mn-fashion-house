import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3"
      aria-label="MN Fashion House"
    >
      <Image
        src="/images/logo.png"
        alt="MN Fashion House Logo"
        width={80}
        height={80}
        className="h-11 w-11 object-contain"
        priority
      />

      <span className="text-xl font-extrabold uppercase tracking-tight text-red-600 sm:text-2xl">
        MN FASHION HOUSE
      </span>
    </Link>
  );
}