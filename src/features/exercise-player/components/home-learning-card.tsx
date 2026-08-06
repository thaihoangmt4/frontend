"use client";
import { ArrowRight, BookOpen, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useStartLearning } from "../hooks";

export function HomeLearningCard() {
  const router = useRouter();
  const start = useStartLearning();
  const result = start.data;
  const empty =
    result?.status === "PathCompleted" ||
    result?.status === "NoPublishedContent";
  async function begin() {
    const session = await start.mutateAsync();
    if (session.lessonAttemptId)
      router.push(`/learn/${session.lessonAttemptId}`);
  }
  return (
    <section className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-600 to-indigo-700 p-7 text-white shadow-sm dark:border-blue-900">
      <div className="max-w-xl">
        <BookOpen className="mb-5 size-9" aria-hidden="true" />
        <h2 className="text-2xl font-bold tracking-tight">
          Your next English lesson is ready
        </h2>
        <p className="mt-2 text-sm leading-6 text-blue-100">
          Follow your personalized learning path. We’ll resume unfinished work
          automatically and include reviews when they’re due.
        </p>
        <Button
          className="mt-6 min-h-11 bg-white px-5 text-blue-700 hover:bg-blue-50"
          size="lg"
          disabled={start.isPending || empty}
          onClick={begin}
        >
          {start.isPending ? (
            <>
              <LoaderCircle className="animate-spin" /> Finding your lesson…
            </>
          ) : (
            <>
              {result?.status === "Resumed"
                ? "Continue learning"
                : "Start learning"}
              <ArrowRight />
            </>
          )}
        </Button>
        {empty && (
          <p className="mt-4 text-sm font-medium text-blue-50" role="status">
            {result.status === "PathCompleted"
              ? "You’ve completed every available lesson. Great work!"
              : "There are no published lessons available yet."}
          </p>
        )}
        {start.isError && (
          <p className="mt-4 text-sm text-red-100" role="alert">
            We couldn’t start your lesson. Please try again.
          </p>
        )}
      </div>
    </section>
  );
}
