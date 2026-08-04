"use client";

import { Check, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ChoiceOptionStatus = "default" | "correct" | "incorrect";

export function ChoiceOption({
  selected,
  disabled,
  status = "default",
  onSelect,
  children,
  label,
}: {
  selected: boolean;
  disabled: boolean;
  status?: ChoiceOptionStatus;
  onSelect: () => void;
  children: ReactNode;
  label: string;
}) {
  const statusLabel =
    status === "correct"
      ? "Correct answer"
      : status === "incorrect"
        ? "Incorrect answer"
        : selected
          ? "Selected"
          : undefined;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={statusLabel ? `${label}. ${statusLabel}` : label}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "relative flex min-h-14 w-full items-center gap-3 rounded-xl border-2 bg-white p-4 text-left text-neutral-800 outline-none transition hover:border-blue-300 hover:bg-blue-50/40 focus-visible:ring-3 focus-visible:ring-blue-500/30 disabled:cursor-default disabled:opacity-80 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-blue-700 dark:hover:bg-blue-950/20",
        selected && status === "default" &&
          "border-blue-600 bg-blue-50 ring-1 ring-blue-600 dark:border-blue-400 dark:bg-blue-950/30 dark:ring-blue-400",
        status === "correct" &&
          "border-emerald-600 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/30",
        status === "incorrect" &&
          "border-red-600 bg-red-50 dark:border-red-500 dark:bg-red-950/30",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-neutral-300 text-white dark:border-neutral-600",
          selected && status === "default" && "border-blue-600 bg-blue-600",
          status === "correct" && "border-emerald-600 bg-emerald-600",
          status === "incorrect" && "border-red-600 bg-red-600",
        )}
      >
        {status === "incorrect" ? (
          <X className="h-3.5 w-3.5" />
        ) : selected || status === "correct" ? (
          <Check className="h-3.5 w-3.5" />
        ) : null}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
      {statusLabel && (
        <span className="sr-only">{statusLabel}</span>
      )}
    </button>
  );
}
