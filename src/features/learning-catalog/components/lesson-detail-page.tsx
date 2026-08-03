"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Circle,
  Headphones,
  Languages,
  Mic,
  Pencil,
  RotateCcw,
  SearchX,
  Text,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { isNotFoundError } from "../errors";
import { useLessonDetailQuery } from "../hooks";
import type {
  KnownLessonSectionType,
  LessonDetail,
  LessonSection,
} from "../types";

const sectionIcons: Record<KnownLessonSectionType, LucideIcon> = {
  Introduction: BookOpen,
  Vocabulary: Languages,
  Grammar: Text,
  Listening: Headphones,
  Speaking: Mic,
  Practice: Pencil,
  Review: RotateCcw,
  Summary: CheckCircle,
};

export function LessonDetailPage({ lessonId }: { lessonId: string }) {
  const lessonQuery = useLessonDetailQuery(lessonId);

  if (lessonQuery.isPending) return <LessonDetailSkeleton />;

  if (lessonQuery.isError) {
    if (isNotFoundError(lessonQuery.error)) return <LessonNotFound />;

    return (
      <LessonDetailError
        isRetrying={lessonQuery.isFetching}
        onRetry={() => lessonQuery.refetch()}
      />
    );
  }

  const lesson = lessonQuery.data;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <LessonBreadcrumb lesson={lesson} />
      <LessonHeader lesson={lesson} />
      <LessonSections sections={lesson.sections} />
    </div>
  );
}

function LessonBreadcrumb({ lesson }: { lesson: LessonDetail }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        <li>
          <Link
            href={`/courses/${lesson.course.id}`}
            className="rounded-md px-1 py-0.5 font-medium text-blue-600 outline-none hover:text-blue-700 focus-visible:ring-3 focus-visible:ring-blue-500/20 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {lesson.course.title}
          </Link>
        </li>
        <BreadcrumbSeparator />
        <li className="px-1 py-0.5 text-neutral-500 dark:text-neutral-400">
          {lesson.unit.title}
        </li>
        <BreadcrumbSeparator />
        <li
          aria-current="page"
          className="px-1 py-0.5 font-medium text-neutral-900 dark:text-neutral-100"
        >
          {lesson.title}
        </li>
      </ol>
    </nav>
  );
}

function BreadcrumbSeparator() {
  return (
    <li aria-hidden="true">
      <ChevronRight className="h-3.5 w-3.5 text-neutral-300 dark:text-neutral-700" />
    </li>
  );
}

function LessonHeader({ lesson }: { lesson: LessonDetail }) {
  const durationLabel =
    lesson.estimatedDurationMinutes === 1 ? "minute" : "minutes";

  return (
    <header>
      <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          {lesson.course.cefrLevel}
        </span>
        <span aria-hidden="true">·</span>
        <span>{lesson.difficultyLevel}</span>
        <span aria-hidden="true">·</span>
        <span>
          {lesson.estimatedDurationMinutes} {durationLabel}
        </span>
      </div>

      <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
        {lesson.title}
      </h1>

      {lesson.description && (
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          {lesson.description}
        </p>
      )}

      {lesson.learningObjectiveSummary && (
        <div className="mt-5 max-w-3xl rounded-xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-900 dark:bg-blue-950/30">
          <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase dark:text-blue-300">
            Learning objective
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            {lesson.learningObjectiveSummary}
          </p>
        </div>
      )}
    </header>
  );
}

function LessonSections({ sections }: { sections: LessonSection[] }) {
  return (
    <section aria-labelledby="lesson-sections-heading">
      <h2
        id="lesson-sections-heading"
        className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100"
      >
        Lesson sections
      </h2>

      {sections.length === 0 ? (
        <div className="mt-4 rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            icon={BookOpen}
            title="Lesson content is being prepared."
          />
        </div>
      ) : (
        <ol className="mt-4 space-y-3">
          {sections.map((section, index) => (
            <LessonSectionItem
              key={section.id}
              section={section}
              ordinal={index + 1}
            />
          ))}
        </ol>
      )}
    </section>
  );
}

function LessonSectionItem({
  section,
  ordinal,
}: {
  section: LessonSection;
  ordinal: number;
}) {
  const Icon = getSectionIcon(section.sectionType);

  return (
    <li className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
              Section {ordinal} · {section.sectionType}
            </p>
            <h3 className="mt-1 text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {section.title}
            </h3>
          </div>
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            {section.isRequired ? "Required" : "Optional"}
          </span>
        </div>
      </div>
    </li>
  );
}

function getSectionIcon(sectionType: string): LucideIcon {
  return sectionIcons[sectionType as KnownLessonSectionType] ?? Circle;
}

function LessonDetailSkeleton() {
  return (
    <div
      className="mx-auto max-w-6xl space-y-8"
      role="status"
      aria-label="Loading lesson"
    >
      <div className="flex gap-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-36" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-64 max-w-full" />
        <Skeleton className="h-9 w-96 max-w-full" />
        <Skeleton className="h-4 w-full max-w-2xl" />
        <Skeleton className="h-20 w-full max-w-3xl rounded-xl" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-7 w-40" />
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-52 max-w-full" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading lesson...</span>
    </div>
  );
}

function LessonNotFound() {
  return (
    <div className="mx-auto max-w-6xl rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <EmptyState
        icon={SearchX}
        title="Lesson not found"
        description="This lesson may no longer be available."
        headingLevel={1}
        action={{ label: "Back to courses", href: "/courses" }}
      />
    </div>
  );
}

function LessonDetailError({
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
        We couldn&apos;t load this lesson.
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
