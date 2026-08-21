import Link from "next/link";

export default function OffersPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-sky-200">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-600">
            MN Fashion House
          </p>

          <h1 className="mt-3 text-4xl font-bold text-slate-950 sm:text-5xl">
            Exclusive{" "}
            <span className="text-red-600">
              Offers
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Discover special prices and selected deals
            from MN Fashion House. Find your favorite
            styles and shop with confidence.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex items-center rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Shop Now
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Special Offers
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Discover selected fashion pieces available
              at special prices for a limited time.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Exclusive Deals
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Enjoy attractive deals across selected
              collections while stocks last.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Shop & Save
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Find your favorite styles and enjoy great
              value on selected products.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}