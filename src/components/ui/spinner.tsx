import { cn } from "@/lib/utils";

type SpinnerSize = "sm" | "md" | "lg";

const SIZE_MAP: Record<SpinnerSize, { wrapper: string; border: string }> = {
  sm: { wrapper: "h-4 w-4", border: "border-2" },
  md: { wrapper: "h-8 w-8", border: "border-[3px]" },
  lg: { wrapper: "h-12 w-12", border: "border-4" },
};

type Props = {
  size?: SpinnerSize;
  label?: string;
  className?: string;
};

export function Spinner({ size = "md", label, className }: Props) {
  const dims = SIZE_MAP[size];

  return (
    <div
      className={cn("flex flex-col items-center gap-3", className)}
      role="status"
      aria-label={label || "Loading"}
    >
      <div
        className={cn(
          dims.wrapper,
          dims.border,
          "animate-spin rounded-full border-neutral-200 border-t-blue-600 dark:border-neutral-800 dark:border-t-blue-400",
        )}
      />
      {label && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {label}
        </p>
      )}
    </div>
  );
}
