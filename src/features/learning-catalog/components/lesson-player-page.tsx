"use client";

import { AlertTriangle, BookOpen, SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { isInvalidLearningFlowError, isNotFoundError } from "../errors";
import {
  isValidLessonId,
  useLessonLearningFlowQuery,
} from "../learning.hooks";
import { LessonPlayer } from "./lesson-player";

export function LessonPlayerPage({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const learningFlowQuery = useLessonLearningFlowQuery(lessonId);

  if (!isValidLessonId(lessonId)) return <LessonUnavailable />;
  if (learningFlowQuery.isPending) return <LessonPlayerSkeleton />;

  if (learningFlowQuery.isError) {
    if (
      isNotFoundError(learningFlowQuery.error) ||
      isInvalidLearningFlowError(learningFlowQuery.error)
    ) {
      return <LessonUnavailable />;
    }

    return (
      <LessonLoadError
        isRetrying={learningFlowQuery.isFetching}
        onBack={() => router.back()}
        onRetry={() => learningFlowQuery.refetch()}
      />
    );
  }

  return <LessonPlayer learningFlow={learningFlowQuery.data} />;
}

function LessonUnavailable() {
  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <EmptyState
        icon={SearchX}
        title="Lesson unavailable"
        description="This lesson is not available for learning right now."
        headingLevel={1}
        action={{ label: "Back to courses", href: "/courses" }}
      />
    </div>
  );
}

function LessonLoadError({
  isRetrying,
  onBack,
  onRetry,
}: {
  isRetrying: boolean;
  onBack: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900 dark:bg-neutral-900">
      <AlertTriangle aria-hidden="true" className="mx-auto h-9 w-9 text-red-500" />
      <h1 className="mt-4 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        We couldn&apos;t load this lesson
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
        Check your connection and try again.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          Go back
        </Button>
        <Button type="button" size="lg" onClick={onRetry} disabled={isRetrying}>
          {isRetrying ? "Trying again..." : "Try again"}
        </Button>
      </div>
    </div>
  );
}

function LessonPlayerSkeleton() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900" role="status" aria-label="Loading lesson">
      <div className="flex items-center gap-4 border-b border-neutral-100 p-5 dark:border-neutral-800">
        <Skeleton className="h-11 w-11 rounded-full" />
        <Skeleton className="h-3 flex-1 rounded-full" />
      </div>
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-2xl space-y-5">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex h-40 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/30">
            <BookOpen aria-hidden="true" className="h-10 w-10 text-blue-200 dark:text-blue-800" />
          </div>
        </div>
      </div>
      <div className="border-t border-neutral-100 p-5 dark:border-neutral-800">
        <Skeleton className="ml-auto h-11 w-32 rounded-lg" />
      </div>
      <span className="sr-only">Loading lesson...</span>
    </div>
  );
}
