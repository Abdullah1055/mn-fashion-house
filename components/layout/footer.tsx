import Link from "next/link";
import Image from "next/image";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaTiktok,
} from "react-icons/fa6";
import {
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
  Send,
} from "lucide-react";

import { Container } from "@/components/common/container";

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "#",
    icon: FaFacebookF,
  },
  {
    label: "Instagram",
    href: "#",
    icon: FaInstagram,
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: FaLinkedinIn,
  },
  {
    label: "YouTube",
    href: "#",
    icon: FaYoutube,
  },
  {
    label: "TikTok",
    href: "#",
    icon: FaTiktok,
  },
];

const QUICK_LINKS = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Shop",
    href: "/products",
  },
  {
    title: "Categories",
    href: "/products",
  },
  {
    title: "Offers",
    href: "/offers",
  },
  {
    title: "About Us",
    href: "/about",
  },
  {
    title: "Contact",
    href: "/contact",
  },
];

const CUSTOMER_LINKS = [
  {
    title: "My Account",
    href: "/account",
  },
  {
    title: "Shopping Cart",
    href: "/cart",
  },
  {
    title: "Order Checkout",
    href: "/checkout",
  },
  {
    title: "Privacy Policy",
    href: "/privacy",
  },
  {
    title: "Terms & Conditions",
    href: "/terms",
  },
];

const MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=SS+Complex%2C+Dhangora+Bazar%2C+Raiganj%2C+Sirajganj%2C+Bangladesh";

export function Footer() {
  return (
    <footer className="border-t border-sky-100 bg-sky-50">
      {/* Main Footer */}
      <div className="py-16 sm:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.35fr_0.8fr_0.9fr_1.25fr]">
            {/* Brand */}
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-3"
                aria-label="MN Fashion House"
              >
                <Image
                  src="/images/logo.png"
                  alt="MN Fashion House Logo"
                  width={42}
                  height={42}
                  className="h-11 w-11 object-contain"
                />

                <span className="text-xl font-extrabold uppercase tracking-tight text-red-600">
                  MN FASHION HOUSE
                </span>
              </Link>

              <p className="mt-5 max-w-sm text-sm leading-7 text-slate-600">
                Premium fashion for everyday lifestyle.
                Quality you can trust, style you will love.
              </p>

              {/* Social Icons */}
              <div className="mt-6 flex items-center gap-2.5">
                {SOCIAL_LINKS.map(
                  ({
                    label,
                    href,
                    icon: Icon,
                  }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <Icon size={16} />
                    </a>
                  )
                )}
              </div>

              {/* Location */}
              <div className="mt-7">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <MapPin size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Showroom Address
                    </p>

                    <p className="mt-1 max-w-sm text-sm leading-6 text-slate-600">
                      SS Complex, Under Dutch-Bangla Bank
                      and beside Agrani Bank, Dhangora
                      Bazar, Raiganj, Sirajganj.
                    </p>

                    <a
                      href={MAP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 transition hover:text-red-700"
                    >
                      View Location
                      <ArrowUpRight size={15} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-950">
                Quick Links
              </h3>

              <ul className="mt-5 space-y-3">
                {QUICK_LINKS.map(
                  (link) => (
                    <li key={link.title}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-600 transition hover:text-red-600"
                      >
                        {link.title}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-950">
                Customer Service
              </h3>

              <ul className="mt-5 space-y-3">
                {CUSTOMER_LINKS.map(
                  (link) => (
                    <li key={link.title}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-600 transition hover:text-red-600"
                      >
                        {link.title}
                      </Link>
                    </li>
                  )
                )}
              </ul>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Phone
                    size={16}
                    className="text-red-600"
                  />
                  <span>Contact Us</span>
                </div>

                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Mail
                    size={16}
                    className="text-red-600"
                  />
                  <span>Email Us</span>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-950">
                Stay Connected
              </h3>

              <p className="mt-5 text-sm leading-6 text-slate-600">
                Subscribe to get updates on new
                arrivals, exclusive offers and
                latest collections.
              </p>

              <form className="mt-5">
                <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-600 text-white transition hover:bg-red-700"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>

              <p className="mt-3 text-xs text-slate-400">
                We respect your privacy. No spam.
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-sky-100 bg-white/70">
        <Container>
          <div className="flex flex-col gap-3 py-5 text-center text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <p>
              © {new Date().getFullYear()} MN Fashion
              House. All rights reserved.
            </p>

            <p>
              Premium Fashion For Everyday Lifestyle
            </p>
          </div>
        </Container>
      </div>
    </footer>
  );
}