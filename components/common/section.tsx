import type { ReactNode } from "react";

import { Container } from "./container";

type SectionProps = {
  children: ReactNode;
};

export function Section({
  children,
}: SectionProps) {
  return (
    <section className="py-20">
      <Container>{children}</Container>
    </section>
  );
}