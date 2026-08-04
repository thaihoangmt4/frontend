"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock3,
  SearchX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { isNotFoundError } from "../errors";
import { useCourseDetailQuery } from "../hooks";
import type { CourseLesson, CourseUnit } from "../types";

export function CourseDetailPage({ courseId }: { courseId: string }) {
  const courseQuery = useCourseDetailQuery(courseId);

  if (courseQuery.isPending) return <CourseDetailSkeleton />;

  if (courseQuery.isError) {
    if (isNotFoundError(courseQuery.error)) return <CourseNotFound />;

    return (
      <CourseDetailError
        isRetrying={courseQuery.isFetching}
        onRetry={() => courseQuery.refetch()}
      />
    );
  }

  const course = courseQuery.data;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <CourseHeader
        cefrLevel={course.cefrLevel}
        title={course.title}
        description={course.description}
      />

      {course.units.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            icon={BookOpen}
            title="Lessons for this course are being prepared."
            description="Check back soon for new learning content."
          />
        </div>
      ) : (
        <UnitList units={course.units} />
      )}
    </div>
  );
}

function CourseHeader({
  cefrLevel,
  title,
  description,
}: {
  cefrLevel: string;
  title: string;
  description: string | null;
}) {
  return (
    <header>
      <Link
        href="/courses"
        className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-neutral-500 outline-none hover:text-blue-600 focus-visible:ring-3 focus-visible:ring-blue-500/20 dark:text-neutral-400 dark:hover:text-blue-400"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back to courses
      </Link>

      <div className="mt-6">
        <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          {cefrLevel}
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
        )}
      </div>
    </header>
  );
}

function UnitList({ units }: { units: CourseUnit[] }) {
  return (
    <div className="space-y-6">
      {units.map((unit, index) => (
        <UnitCard key={unit.id} unit={unit} ordinal={index + 1} />
      ))}
    </div>
  );
}

function UnitCard({ unit, ordinal }: { unit: CourseUnit; ordinal: number }) {
  return (
    <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="border-b border-neutral-200 px-5 py-5 sm:px-6 dark:border-neutral-800">
        <p className="text-xs font-semibold tracking-wide text-blue-600 uppercase dark:text-blue-400">
          Unit {ordinal}
        </p>
        <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          {unit.title}
        </h2>
        {unit.description && (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            {unit.description}
          </p>
        )}
      </div>

      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {unit.lessons.map((lesson) => (
          <LessonListItem key={lesson.id} lesson={lesson} />
        ))}
      </div>
    </section>
  );
}

function LessonListItem({ lesson }: { lesson: CourseLesson }) {
  return (
    <Link
      href={`/learn/lessons/${lesson.id}`}
      aria-label={`Start lesson ${lesson.title}`}
      className="group flex flex-col gap-4 p-5 outline-none transition-colors hover:bg-blue-50/40 focus-visible:bg-blue-50 focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-blue-500/20 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:hover:bg-blue-950/20 dark:focus-visible:bg-blue-950/30"
    >
      <div className="min-w-0">
        <h3 className="font-semibold text-neutral-900 group-hover:text-blue-700 dark:text-neutral-100 dark:group-hover:text-blue-300">
          {lesson.title}
        </h3>
        {lesson.description && (
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            {lesson.description}
          </p>
        )}
        {lesson.learningObjectiveSummary && (
          <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            <span className="font-medium">You&apos;ll learn:</span>{" "}
            {lesson.learningObjectiveSummary}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
            {lesson.estimatedDurationMinutes} min
          </span>
          <span aria-hidden="true">·</span>
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            {lesson.difficultyLevel}
          </span>
        </div>
      </div>

      <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400">
        Start lesson
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </span>
    </Link>
  );
}

function CourseDetailSkeleton() {
  return (
    <div
      className="mx-auto max-w-6xl space-y-8"
      role="status"
      aria-label="Loading course"
    >
      <div className="space-y-4">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-6 w-12 rounded-full" />
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>

      {Array.from({ length: 2 }).map((_, unitIndex) => (
        <div
          key={unitIndex}
          className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="space-y-3 border-b border-neutral-200 p-6 dark:border-neutral-800">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-full max-w-lg" />
          </div>
          {Array.from({ length: 2 }).map((_, lessonIndex) => (
            <div key={lessonIndex} className="space-y-3 p-6">
              <Skeleton className="h-5 w-56 max-w-full" />
              <Skeleton className="h-4 w-full max-w-xl" />
              <Skeleton className="h-5 w-36" />
            </div>
          ))}
        </div>
      ))}
      <span className="sr-only">Loading course...</span>
    </div>
  );
}

function CourseNotFound() {
  return (
    <div className="mx-auto max-w-6xl rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <EmptyState
        icon={SearchX}
        title="Course not found"
        description="This course may no longer be available."
        headingLevel={1}
        action={{ label: "Back to courses", href: "/courses" }}
      />
    </div>
  );
}

function CourseDetailError({
  isRetrying,
  onRetry,
}: {
  isRetrying: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto max-w-6xl rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900 dark:bg-neutral-900">
      <AlertTriangle
        aria-hidden="true"
        className="mx-auto h-8 w-8 text-red-500"
      />
      <h1 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        We couldn&apos;t load this course.
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        Please try again in a moment.
      </p>
      <Button
        type="button"
        className="mt-6"
        onClick={onRetry}
        disabled={isRetrying}
      >
        {isRetrying ? "Trying again..." : "Try again"}
      </Button>
    </div>
  );
}
