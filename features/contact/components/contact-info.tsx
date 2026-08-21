import {
  MapPin,
  ArrowUpRight,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";

import { Container } from "@/components/common/container";

const MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=SS+Complex%2C+Dhangora+Bazar%2C+Raiganj%2C+Sirajganj%2C+Bangladesh";

const PHONE_NUMBER = "+8801304221232";

const WHATSAPP_URL =
  "https://wa.me/8801304221232";

export function ContactInfo() {
  return (
    <section className="bg-white py-14 sm:py-18">
      <Container>
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Showroom */}

          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <MapPin size={21} />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-red-600">
              Visit Us
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-950">
              Our Showroom
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              SS Complex, Under Dutch-Bangla Bank and beside
              Agrani Bank, Dhangora Bazar, Raiganj, Sirajganj.
            </p>

            <a
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 transition hover:text-red-700"
            >
              View Location
              <ArrowUpRight size={15} />
            </a>
          </div>

          {/* Phone / WhatsApp */}

          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <Phone size={21} />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-red-600">
              Call or WhatsApp
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-950">
              +880 1304-221232
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Have a question about our products or need
              assistance? Call us directly or message us on
              WhatsApp.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={`tel:${PHONE_NUMBER}`}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <Phone size={15} />
                Call Us
              </a>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <MessageCircle size={15} />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Email */}

          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Mail size={21} />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-red-600">
              Email
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-950">
              Email Us
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              For product questions, customer support, or other
              inquiries, you can use the message form below.
            </p>

            <p className="mt-5 text-sm font-semibold text-slate-900">
              We&apos;ll be glad to hear from you.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}