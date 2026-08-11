import Link from "next/link";
import {
  ArrowRight,
  Search,
  Truck,
  ShieldCheck,
  Award,
  Headphones,
  ChevronDown,
} from "lucide-react";

import { Container } from "@/components/common/container";

const CATEGORIES = [
  "Men",
  "Women",
  "Kids",
  "Accessories",
];

export function Hero() {
  return (
    <section className="overflow-hidden bg-sky-50">
      <Container>
        <div className="grid min-h-[680px] items-center gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
          {/* Left Content */}
          <div className="relative z-10">
            <div className="inline-flex rounded-full border border-red-200 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-red-600 shadow-sm">
              New Collection 2026
            </div>

            <h1 className="mt-7 max-w-2xl text-5xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-[72px]">
              Style That
              <br />
              <span className="text-red-600">
                Speaks Before
              </span>
              <br />
              You Do.
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Discover premium quality fashion curated
              for everyday elegance. Minimal design.
              Maximum confidence.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
              >
                Shop Now
                <ArrowRight size={17} />
              </Link>

              <Link
                href="/products"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-white bg-white px-6 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-200 hover:bg-slate-50"
              >
                Explore Collection
              </Link>
            </div>

            {/* Search */}
            <form
              action="/products"
              method="GET"
              className="mt-7 max-w-2xl rounded-xl border border-white bg-white p-2 shadow-lg shadow-slate-200/50"
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                {/* Category */}
                <div className="relative sm:w-44">
                  <select
                    name="category"
                    defaultValue=""
                    className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  >
                    <option value="">
                      All Categories
                    </option>

                    {CATEGORIES.map(
                      (category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>

                {/* Search Input */}
                <div className="flex h-11 flex-1 items-center gap-3 rounded-lg px-3">
                  <Search
                    size={18}
                    className="shrink-0 text-slate-400"
                  />

                  <input
                    type="search"
                    name="search"
                    placeholder="Search for products, categories..."
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  aria-label="Search products"
                  className="flex h-11 items-center justify-center rounded-lg bg-red-600 px-5 text-white transition hover:bg-red-700"
                >
                  <Search size={18} />
                </button>
              </div>
            </form>
          </div>

          {/* Right Hero Visual */}
          <div className="relative">
            <div className="absolute -right-20 -top-16 h-72 w-72 rounded-full bg-sky-200/60 blur-3xl" />

            <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-white/80 blur-3xl" />

            <div className="relative flex min-h-[470px] items-center justify-center overflow-hidden rounded-[40px] bg-gradient-to-br from-sky-100 via-white to-sky-200 p-8 shadow-sm sm:min-h-[560px]">
              <div className="absolute right-[-5%] top-[5%] h-[90%] w-[90%] rounded-full bg-sky-200/60" />

              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-sky-100/80 to-transparent" />

              <img
                src="/images/hero-fashion.jpg"
                alt="MN Fashion House collection"
                className="relative z-10 h-full max-h-[540px] w-full object-contain object-bottom"
              />
            </div>

            {/* Floating badge */}
            <div className="absolute bottom-6 left-5 z-20 hidden rounded-xl border border-white bg-white/95 px-4 py-3 shadow-lg sm:block">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                MN Fashion House
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                Premium Everyday Fashion
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* Service Highlights */}
      <div className="border-t border-sky-100 bg-white/90">
        <Container>
          <div className="grid gap-1 py-5 sm:grid-cols-2 lg:grid-cols-4">
            <ServiceItem
              icon={<Truck size={21} />}
              title="Free Delivery"
              description="Fast delivery at your door"
            />

            <ServiceItem
              icon={<ShieldCheck size={21} />}
              title="Secure Payment"
              description="100% secure & safe"
            />

            <ServiceItem
              icon={<Award size={21} />}
              title="Premium Quality"
              description="Finest fabrics & materials"
            />

            <ServiceItem
              icon={<Headphones size={21} />}
              title="Customer Support"
              description="We're here to help you"
            />
          </div>
        </Container>
      </div>
    </section>
  );
}

function ServiceItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl px-4 py-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}