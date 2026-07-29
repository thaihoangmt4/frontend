import { cn } from "@/lib/utils";

// ── Base skeleton pulse ──

type SkeletonProps = {
  className?: string;
};

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800",
        className,
      )}
    />
  );
}

// ── Preset skeletons ──

function Text({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full",
          )}
        />
      ))}
    </div>
  );
}

function Heading({ className }: { className?: string }) {
  return <Skeleton className={cn("h-7 w-48", className)} />;
}

function Card({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900",
        className,
      )}
    >
      <Skeleton className="mb-3 h-4 w-24" />
      <Skeleton className="mb-2 h-8 w-16" />
      <Skeleton className="h-3 w-36" />
    </div>
  );
}

function Avatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-14 w-14" };
  return <Skeleton className={cn("rounded-full", dims[size])} />;
}

function Button({ className }: { className?: string }) {
  return <Skeleton className={cn("h-10 w-28 rounded-lg", className)} />;
}

function Page({ cards = 3 }: { cards?: number }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Heading />
        <Text lines={1} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <Card key={i} />
        ))}
      </div>
    </div>
  );
}

export {
  Skeleton,
  Text as SkeletonText,
  Heading as SkeletonHeading,
  Card as SkeletonCard,
  Avatar as SkeletonAvatar,
  Button as SkeletonButton,
  Page as SkeletonPage,
};
