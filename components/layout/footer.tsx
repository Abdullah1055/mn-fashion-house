import { Container } from "@/components/common/container";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white py-14">

      <Container>

        <div className="text-center">

          <h3 className="font-serif text-2xl font-bold">
            MN Fashion House
          </h3>

          <p className="mt-3 text-sm text-neutral-500">
            Premium Fashion For Everyday Lifestyle
          </p>

          <p className="mt-8 text-xs text-neutral-400">
            © 2026 MN Fashion House. All rights reserved.
          </p>

        </div>

      </Container>

    </footer>
  );
}