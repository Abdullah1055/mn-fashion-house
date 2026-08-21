import {
  Heart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Container } from "@/components/common/container";

const values = [
  {
    icon: ShieldCheck,
    title: "Quality First",
    description:
      "We focus on carefully selected products and quality that our customers can trust.",
  },
  {
    icon: Sparkles,
    title: "Modern Style",
    description:
      "Our collections bring together contemporary designs with practical everyday fashion.",
  },
  {
    icon: Heart,
    title: "Customer Confidence",
    description:
      "Everything we do is centered around creating a comfortable and confident shopping experience.",
  },
];

export function BrandValues() {
  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-600">
            What We Believe
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            The Values Behind
            <br />
            <span className="text-red-600">
              MN Fashion House
            </span>
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Our approach is simple: offer thoughtfully selected
            fashion while putting quality and customer experience
            first.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <div
                key={value.title}
                className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Icon size={21} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-950">
                  {value.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}