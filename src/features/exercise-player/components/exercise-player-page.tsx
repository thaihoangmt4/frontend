"use client";
import { AlertTriangle, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAttempt } from "../hooks";
import { ExercisePlayer } from "./exercise-player";

export function ExercisePlayerPage({ attemptId }: { attemptId: string }) {
  const query = useAttempt(attemptId);
  if (query.isPending)
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-sm text-neutral-500">
        <LoaderCircle className="animate-spin" /> Loading your lesson…
      </div>
    );
  if (query.isError || !query.data)
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
        <AlertTriangle className="mb-3" />
        <h1 className="font-semibold">We couldn’t load this lesson</h1>
        <p className="mt-1 text-sm">
          It may no longer be available, or your connection was interrupted.
        </p>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => query.refetch()}
        >
          Try again
        </Button>
      </div>
    );
  return <ExercisePlayer initialAttempt={query.data} />;
}
