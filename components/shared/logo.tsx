import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="font-serif text-3xl font-bold tracking-wide"
    >
      MN Fashion House
    </Link>
  );
}