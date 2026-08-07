"use client";
import Link from "next/link";
import { Check, Circle, LockKeyhole, Map } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useLearningProgress } from "../hooks";

export function LearningProgressPage() {
  const query = useLearningProgress();
  if (query.isPending) return <RoadmapSkeleton />;
  if (query.isError || !query.data) return <EmptyState icon={Map} headingLevel={1} title="We couldn’t load your progress" description="Your progress is safe. Try loading it again." action={{ label: query.isFetching ? "Trying again…" : "Try again", onClick: () => query.refetch() }} />;
  const progress = query.data;
  const course = progress.course;
  if (progress.state === "NoActiveAssignment" || course === null) return <div className="rounded-2xl border bg-white shadow-sm dark:bg-neutral-900"><EmptyState icon={Map} headingLevel={1} title="Your learning path hasn’t been assigned yet." description="You don’t need to choose a course. Your assigned learning path will appear here automatically when it’s ready." /></div>;
  return <div className="mx-auto max-w-4xl space-y-8">
    <header className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8 dark:bg-neutral-900">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Your assigned course</p><h1 className="mt-2 text-3xl font-bold tracking-tight">{course.courseTitle}</h1>
      <p className="mt-3 text-sm text-neutral-500">{progress.completedLessonCount} of {progress.totalLessonCount} lessons completed</p>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"><div className="h-full rounded-full bg-blue-600" style={{ width: `${progress.progressPercentage}%` }} /></div>
    </header>
    <div className="space-y-6">{progress.units.map((unit, unitIndex) => <section key={unit.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-neutral-900">
      <header className="border-b px-5 py-4 sm:px-6"><p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Unit {unitIndex + 1}</p><h2 className="mt-1 text-lg font-semibold">{unit.title}</h2></header>
      <ol className="divide-y">{unit.lessons.map((lesson, lessonIndex) => <li key={lesson.id} className="flex items-center gap-4 px-5 py-4 sm:px-6">
        <StateIcon state={lesson.state} /><div className="min-w-0 flex-1"><p className="text-xs text-neutral-400">Lesson {lessonIndex + 1}</p><h3 className={cn("font-medium", lesson.state === "Upcoming" && "text-neutral-500")}>{lesson.title}</h3></div>
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", lesson.state === "Completed" && "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300", lesson.state === "Current" && "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300", lesson.state === "Upcoming" && "bg-neutral-100 text-neutral-500 dark:bg-neutral-800")}>{lesson.state}</span>
        {lesson.state === "Completed" && lesson.lessonAttemptId && <Link className="rounded-md text-sm font-medium text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" href={`/lesson-attempts/${lesson.lessonAttemptId}/result`}>View result</Link>}
      </li>)}</ol>
    </section>)}</div>
  </div>;
}
function StateIcon({ state }: { state: "Completed" | "Current" | "Upcoming" }) { const Icon = state === "Completed" ? Check : state === "Current" ? Circle : LockKeyhole; return <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", state === "Completed" ? "bg-emerald-100 text-emerald-700" : state === "Current" ? "bg-blue-100 text-blue-700 ring-4 ring-blue-50" : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800")}><Icon className="size-4" aria-hidden="true" /></span>; }
function RoadmapSkeleton() { return <div className="mx-auto max-w-4xl space-y-6" role="status" aria-label="Loading learning progress"><Skeleton className="h-44 rounded-2xl" />{[1,2].map((x) => <Skeleton key={x} className="h-64 rounded-2xl" />)}<span className="sr-only">Loading learning progress…</span></div>; }
