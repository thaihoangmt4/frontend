"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LessonHeader({
  position,
  total,
  isReview,
  onExit,
}: {
  position: number;
  total: number;
  isReview: boolean;
  onExit: () => void;
}) {
  const percent = total > 0 ? Math.round((position / total) * 100) : 0;

  return (
    <header className="flex items-center gap-3 border-b bg-white px-4 py-3 sm:px-6 dark:bg-neutral-900">
      <Button
        variant="ghost"
        size="icon-lg"
        aria-label="Exit lesson"
        onClick={onExit}
      >
        <X />
      </Button>

      <div className="min-w-0 flex-1">
        <div
          className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={position}
          aria-valuetext={`Exercise ${position} of ${total}`}
        >
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        {isReview && (
          <p className="mt-1 text-xs font-medium text-blue-700 dark:text-blue-300">
            Review
          </p>
        )}
      </div>

      <span className="shrink-0 text-sm font-semibold tabular-nums">
        {position} / {total}
      </span>
    </header>
  );
}
