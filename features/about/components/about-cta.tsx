import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/common/container";

export function AboutCTA() {
  return (
    <section className="bg-sky-200 py-16 sm:py-20">
      <Container>
        <div className="rounded-[28px] border border-white/70 bg-white/80 px-6 py-10 text-center shadow-sm backdrop-blur-sm sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-600">
            Your Confidence, Our Commitment.
          </p>

          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Find Your Style.
            <br />
            Make It Yours.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600">
            Explore our latest collection and discover
            fashion designed to complement your confidence.
          </p>

          <div className="mt-7">
            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
            >
              Shop Collection
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}