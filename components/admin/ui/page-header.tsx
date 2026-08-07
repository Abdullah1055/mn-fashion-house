import Link from "next/link";
import { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;

  // New API
  actionLabel?: string;
  actionHref?: string;

  // Backward compatibility
  action?: ReactNode;
};

export function PageHeader({
  title,
  description,
  actionLabel,
  actionHref,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>

        {description && (
          <p className="mt-2 text-neutral-500">
            {description}
          </p>
        )}
      </div>

      {action ? (
        action
      ) : actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="rounded-lg bg-sky-600 px-5 py-3 text-white hover:bg-sky-700"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}