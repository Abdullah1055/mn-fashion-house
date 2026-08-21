import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/common/container";

export function AboutHero() {
  return (
    <section className="overflow-hidden bg-sky-200">
      <Container>
        <div className="grid items-center gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
          {/* Content */}

          <div className="relative z-10">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-red-600">
              About MN Fashion House
            </p>

            <h1 className="max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-[56px]">
              Fashion That
              <br />

              <span className="text-red-600">
                Reflects
              </span>{" "}
              Your Confidence.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              MN Fashion House brings together quality,
              contemporary style, and a shopping experience
              designed around confidence and individuality.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
              >
                Explore Collection
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>

          {/* Visual */}

          <div className="relative">
            <div className="relative overflow-hidden rounded-[32px] bg-white p-3 shadow-sm">
              <div className="overflow-hidden rounded-[24px]">
                <img
                  src="/images/hero-fashion.png"
                  alt="MN Fashion House fashion collection"
                  className="block h-auto w-full object-cover"
                />
              </div>

              <div className="absolute bottom-7 left-7 rounded-xl border border-white/70 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-600">
                  Our Promise
                </p>

                <p className="mt-1 text-sm font-bold text-slate-900">
                  Your Confidence, Our Commitment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}