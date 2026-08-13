import Link from "next/link";
import {
  ArrowRight,
  Search,
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
    <section className="overflow-hidden bg-sky-200">
      <Container>
        <div className="grid min-h-[260px] items-center gap-2 py-4 lg:grid-cols-[0.95fr_1.05fr] lg:py-4">

          {/* =====================================================
              LEFT CONTENT
          ====================================================== */}
          <div className="relative z-10">

            {/* Heading */}
            <h1 className="mt-2 max-w-2xl text-2xl font-bold leading-[1.1] tracking-tight text-slate-950 sm:text-3xl lg:text-[50px]">
              Style That
              <br />

              <span className="text-red-600">
                Speaks Before
              </span>

              <br />

              You Do.
            </h1>

            {/* Description */}
            <p className="mt-2 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Discover premium quality fashion curated
              for everyday elegance. Minimal design.
              Maximum confidence.
            </p>

            {/* CTA */}
            <div className="mt-2 flex flex-wrap gap-3">
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

          {/* =====================================================
              RIGHT HERO VISUAL
          ====================================================== */}
          <div className="relative">

            {/* Hero Image */}
            <div className="relative overflow-hidden rounded-[32px] shadow-sm lg:w-[calc(100%+50px)]">
              <img
                src="/images/hero-fashion.png"
                alt="MN Fashion House collection"
                className="block h-auto w-full object-contain"
              />
            </div>

            {/* Floating Badge */}
            <div className="absolute bottom-5 left-5 z-20 rounded-xl border border-white/70 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-red-900">
                MN Fashion House
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                Premium Everyday Fashion
              </p>
            </div>

          </div>
        </div>
      </Container>
    </section>
  );
}