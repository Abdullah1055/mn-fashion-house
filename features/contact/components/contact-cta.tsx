import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { Container } from "@/components/common/container";

const MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=SS+Complex%2C+Dhangora+Bazar%2C+Raiganj%2C+Sirajganj%2C+Bangladesh";

export function ContactCTA() {
  return (
    <section className="bg-white py-14 sm:py-18">
      <Container>
        <div className="rounded-[28px] bg-sky-200 px-6 py-10 text-center sm:px-10 sm:py-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-red-600 shadow-sm">
            <MapPin size={21} />
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-red-600">
            Visit MN Fashion House
          </p>

          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Experience Our Collection
            <br />
            <span className="text-red-600">
              In Person.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600">
            Visit our showroom at Dhangora Bazar, Raiganj,
            Sirajganj and explore our collection in person.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
            >
              View Showroom
              <MapPin size={16} />
            </a>

            <Link
              href="/products"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white bg-white px-6 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
            >
              Explore Collection
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}