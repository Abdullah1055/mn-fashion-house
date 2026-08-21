import {
  Globe2,
  Store,
} from "lucide-react";

import { Container } from "@/components/common/container";

const experiences = [
  {
    icon: Globe2,
    label: "Online Shopping",
    title: "Shop From Anywhere",
    description:
      "Browse our collections online, discover your favorite styles, and enjoy a convenient shopping experience from wherever you are.",
  },
  {
    icon: Store,
    label: "Showroom Experience",
    title: "Experience Fashion In Person",
    description:
      "Visit our showroom to explore selected collections in person and experience the products before making your choice.",
  },
];

export function ShoppingExperience() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <Container>
        <div className="grid gap-6 lg:grid-cols-2">
          {experiences.map((experience) => {
            const Icon = experience.icon;

            return (
              <div
                key={experience.title}
                className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                    <Icon size={21} />
                  </div>

                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">
                    {experience.label}
                  </p>
                </div>

                <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">
                  {experience.title}
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                  {experience.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}