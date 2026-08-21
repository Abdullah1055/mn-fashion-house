import { Container } from "@/components/common/container";

export function BrandStory() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          {/* Section heading */}

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-600">
              Our Story
            </p>

            <h2 className="mt-3 max-w-md text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl">
              Built Around
              <br />
              <span className="text-red-600">
                Style & Confidence.
              </span>
            </h2>
          </div>

          {/* Story */}

          <div className="max-w-3xl space-y-5 text-base leading-7 text-slate-600">
            <p>
              MN Fashion House was created with a simple idea:
              fashion should feel personal, comfortable, and
              confident.
            </p>

            <p>
              We carefully curate collections that combine
              contemporary style with everyday wearability,
              giving our customers the freedom to find pieces
              that naturally fit their personality and lifestyle.
            </p>

            <p>
              From our showroom experience to our online store,
              we aim to make discovering and choosing fashion
              simple, enjoyable, and trustworthy.
            </p>

            <p className="font-semibold text-slate-900">
              Every collection is selected with our customers
              in mind — because what you wear should represent
              who you are.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}