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

      <div className="flex items-center gap-4">
        <span className="text-xl font-black uppercase tracking-tight text-blue-600 sm:text-2xl">
          M N
        </span>

        <span className="text-xl font-black uppercase tracking-tight text-blue-600 sm:text-2xl">
          F A S H I O N
        </span>

        <span className="text-xl font-black uppercase tracking-tight text-blue-600 sm:text-2xl">
          H O U S E
        </span>
      </div>
    </Link>
  );
}