import { Send } from "lucide-react";

import { Container } from "@/components/common/container";

export function ContactForm() {
  return (
    <section className="bg-slate-50 py-8 sm:py-10">
      <Container>
        <div className="mx-auto max-w-4xl">
          {/* Heading */}

          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-600">
              Send A Message
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              How Can We
              <span className="text-red-600"> Help?</span>
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Fill out the form below and share your question
              or message with us.
            </p>
          </div>

          {/* Form */}

          <form className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            {/* Basic Information */}

            <div className="grid gap-4 md:grid-cols-3">
              {/* Name */}

              <div>
                <label
                  htmlFor="name"
                  className="text-sm font-semibold text-slate-900"
                >
                  Your Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              {/* Email */}

              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-slate-900"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              {/* Phone */}

              <div>
                <label
                  htmlFor="phone"
                  className="text-sm font-semibold text-slate-900"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>
            </div>

            {/* Message */}

            <div className="mt-4">
              <label
                htmlFor="message"
                className="text-sm font-semibold text-slate-900"
              >
                Message
              </label>

              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Write your message..."
                className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </div>

            {/* Submit */}

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
              >
                Send Message
                <Send size={15} />
              </button>
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
}