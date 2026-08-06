import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/common/container";

export function Hero() {
  return (
    <section className="bg-white">
      <Container>
        <div className="grid min-h-[80vh] items-center gap-14 py-20 lg:grid-cols-2">
          <div>
            <span className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
              New Collection 2026
            </span>

            <h1 className="mt-8 font-serif text-5xl font-bold leading-tight lg:text-7xl">
              Style That
              <br />
              Speaks Before
              <br />
              You Do.
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-neutral-500">
              Discover premium quality fashion curated for everyday elegance.
              Minimal design. Maximum confidence.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button size="lg">
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button variant="outline" size="lg">
                View Collection
              </Button>
            </div>
          </div>

          <div>
            <div className="flex aspect-square items-center justify-center rounded-[40px] border border-neutral-200 bg-neutral-100">
              <div className="text-center">
                <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
                  Hero Banner
                </p>

                <h3 className="mt-3 text-2xl font-semibold">
                  Coming Soon
                </h3>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}