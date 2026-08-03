import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  headingLevel?: 1 | 2 | 3;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  headingLevel = 3,
  action,
  className,
}: Props) {
  const Heading = headingLevel === 1 ? "h1" : headingLevel === 2 ? "h2" : "h3";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 py-16 text-center",
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
          <Icon
            aria-hidden="true"
            className="h-6 w-6 text-neutral-400 dark:text-neutral-500"
          />
        </div>
      )}

      <Heading className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </Heading>

      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-6">
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-5 text-sm font-medium text-white outline-none hover:bg-blue-700 focus-visible:ring-3 focus-visible:ring-blue-500/30"
            >
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-5 text-sm font-medium text-white outline-none hover:bg-blue-700 focus-visible:ring-3 focus-visible:ring-blue-500/30"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
