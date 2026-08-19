import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/common/container";

export function Hero() {
  return (
    <section className="overflow-hidden bg-sky-200">
      <Container>
        <div className="grid items-center gap-8 py-5 lg:grid-cols-[0.95fr_1.05fr] lg:py-5">
          {/* =====================================================
              LEFT CONTENT
          ====================================================== */}

          <div className="relative z-10">
            {/* Heading */}

            <h1 className="max-w-2xl text-2xl font-bold leading-[1.1] tracking-tight text-slate-950 sm:text-3xl lg:text-[50px]">
              Style That
              <br />

              <span className="text-red-600">
                Speaks Before
              </span>

              <br />

              You Do.
            </h1>

            {/* Description */}

            <p className="mt-3 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Discover premium quality fashion
              curated for everyday elegance.
              Minimal design. Maximum confidence.
            </p>

            {/* CTA */}

            <div className="mt-5 flex flex-wrap gap-3">
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