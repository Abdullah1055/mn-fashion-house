import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  children: ReactNode;
  className?: string;
};

export function SectionCard({
  children,
  className,
}: SectionCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border bg-white p-6 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}