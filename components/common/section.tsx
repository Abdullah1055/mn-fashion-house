import type { ReactNode } from "react";

import { Container } from "./container";

type SectionProps = {
  children: ReactNode;
  className?: string;
};

export function Section({
  children,
  className = "",
}: SectionProps) {
  return (
    <section
      className={`py-20 ${className}`}
    >
      <Container>{children}</Container>
    </section>
  );
}