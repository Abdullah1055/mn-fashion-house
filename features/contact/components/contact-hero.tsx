import { Container } from "@/components/common/container";

export function ContactHero() {
  return (
    <section className="overflow-hidden bg-sky-200">
      <Container>
        <div className="py-14 text-center sm:py-18 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-600">
            Contact MN Fashion House
          </p>

          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-[56px]">
            Let&apos;s Connect
            <br />
            <span className="text-red-600">
              With Us.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Have a question, need assistance, or want to visit
            our showroom? We&apos;re here to help make your
            shopping experience simple and enjoyable.
          </p>
        </div>
      </Container>
    </section>
  );
}