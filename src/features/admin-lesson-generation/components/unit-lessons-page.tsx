"use client";

import Link from "next/link";
import { BookOpen, Plus, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminUnitLessons } from "../hooks";

export function UnitLessonsPage({ unitId }: { unitId: string }) {
  const query = useAdminUnitLessons(unitId);

  if (query.isPending) return <LessonsSkeleton />;

  if (query.isError || !query.data) {
    return (
      <div className="mx-auto max-w-4xl rounded-xl border bg-card shadow-sm">
        <EmptyState
          icon={TriangleAlert}
          headingLevel={1}
          title="We couldn’t load this unit’s lessons"
          description="Check the connection and try again."
          action={{
            label: query.isFetching ? "Trying again…" : "Try again",
            onClick: () => query.refetch(),
          }}
        />
      </div>
    );
  }

  const { unit, items } = query.data;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Unit</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {unit.title}
          </h1>
        </div>
        <Button
          render={<Link href={`/admin/units/${unitId}/lessons/new`} />}
          nativeButton={false}
          className="min-h-11"
        >
          <Plus /> Add Lesson
        </Button>
      </header>

      <section
        aria-labelledby="unit-lessons-heading"
        className="overflow-hidden rounded-xl border bg-card shadow-sm"
      >
        <h2 id="unit-lessons-heading" className="border-b px-5 py-4 font-semibold">
          Lessons
        </h2>
        {items.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No lessons yet"
            description="Generate the first AI lesson for this unit."
          />
        ) : (
          <ol className="divide-y">
            {items.map((lesson) => (
              <li key={lesson.id} className="flex items-center gap-4 px-5 py-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                  {lesson.order}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{lesson.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[lesson.topic, lesson.difficultyLevel]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function LessonsSkeleton() {
  return (
    <div
      className="mx-auto max-w-4xl space-y-5"
      role="status"
      aria-label="Loading lessons"
    >
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-72 rounded-xl" />
      <span className="sr-only">Loading lessons…</span>
    </div>
  );
}
