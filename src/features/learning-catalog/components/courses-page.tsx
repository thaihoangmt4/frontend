"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCoursesQuery } from "../hooks";
import type { CourseListItem } from "../types";

export function CoursesPage() {
  const coursesQuery = useCoursesQuery();

  if (coursesQuery.isPending) return <CoursesSkeleton />;

  if (coursesQuery.isError || !coursesQuery.data) {
    return (
      <CoursesErrorState
        isRetrying={coursesQuery.isFetching}
        onRetry={() => coursesQuery.refetch()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <CoursesPageHeader />

      {coursesQuery.data.items.length === 0 ? (
        <CoursesEmptyState />
      ) : (
        <CourseGrid courses={coursesQuery.data.items} />
      )}
    </div>
  );
}

function CoursesPageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
        Choose your course
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        Start with the level that matches your English skills.
      </p>
    </div>
  );
}

function CourseGrid({ courses }: { courses: CourseListItem[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}

function CourseCard({ course }: { course: CourseListItem }) {
  const lessonLabel = course.lessonCount === 1 ? "lesson" : "lessons";

  return (
    <Link
      href={`/courses/${course.id}`}
      aria-label={`View ${course.title}`}
      className="group flex min-h-64 flex-col rounded-xl border border-neutral-200 bg-white p-6 shadow-sm outline-none transition-colors hover:border-blue-300 hover:bg-blue-50/30 focus-visible:border-blue-500 focus-visible:ring-3 focus-visible:ring-blue-500/20 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-blue-800 dark:hover:bg-blue-950/20"
    >
      <div>
        <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          {course.cefrLevel}
        </span>

        <h2 className="mt-5 text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          {course.title}
        </h2>

        {course.description && (
          <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            {course.description}
          </p>
        )}
      </div>

      <div className="mt-auto flex items-end justify-between gap-4 pt-8">
        <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {course.lessonCount} {lessonLabel}
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300">
          View course
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function CoursesSkeleton() {
  return (
    <div
      className="mx-auto max-w-6xl space-y-8"
      role="status"
      aria-label="Loading courses"
    >
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-full max-w-sm" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="min-h-64 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <Skeleton className="h-6 w-12 rounded-full" />
            <Skeleton className="mt-5 h-6 w-36" />
            <div className="mt-3 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="mt-16 flex justify-between gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading courses...</span>
    </div>
  );
}

function CoursesEmptyState() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <EmptyState
        icon={BookOpen}
        title="No courses are available yet."
        description="New learning content will appear here soon."
      />
    </div>
  );
}

function CoursesErrorState({
  isRetrying,
  onRetry,
}: {
  isRetrying: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900 dark:bg-neutral-900">
        <AlertTriangle
          aria-hidden="true"
          className="mx-auto h-8 w-8 text-red-500"
        />
        <h1 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          We couldn&apos;t load the courses.
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
    </div>
  );
}
