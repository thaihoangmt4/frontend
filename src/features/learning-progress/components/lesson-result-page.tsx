"use client";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useLessonAttemptResult } from "../hooks";

export function LessonResultPage({ attemptId }: { attemptId: string }) {
  const query = useLessonAttemptResult(attemptId);
  const router = useRouter();
  if (query.isPending) return <ResultSkeleton />;
  if (query.isError || !query.data) return <EmptyState icon={CheckCircle2} headingLevel={1} title="We couldn’t load this result" description="It may not exist or belong to your account." action={{ label: "Try again", onClick: () => query.refetch() }} />;
  const result = query.data;
  return <div className="mx-auto max-w-3xl space-y-6">
    <header className="rounded-2xl border bg-gradient-to-br from-emerald-50 to-blue-50 p-7 text-center dark:from-emerald-950/20 dark:to-blue-950/20">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 className="size-7" /></div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Lesson result</p><h1 className="mt-2 text-3xl font-bold">{result.lessonTitle}</h1>
      <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-3"><Metric label="Score" value={`${Math.round(result.totalScore)}%`} /><Metric label="Correct" value={String(result.correctCount)} /><Metric label="Activities" value={`${result.completedActivityCount}/${result.totalActivityCount}`} /></div>
    </header>
    <section className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-neutral-900"><h2 className="border-b px-5 py-4 font-semibold">Activity summary</h2><ol className="divide-y">{result.activities.map((activity) => <li key={activity.activityId} className="flex items-center gap-4 px-5 py-4"><span className="flex size-8 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold dark:bg-neutral-800">{activity.displayOrder}</span><div className="min-w-0 flex-1"><p className="font-medium">{activity.exerciseTitle}</p><p className="text-xs text-neutral-500">{activity.evaluationStatus ?? (activity.completed ? "Completed" : "Not completed")}</p></div><span className="text-sm font-semibold">{activity.score == null ? "—" : `${Math.round(activity.score)}%`}</span></li>)}</ol></section>
    <div className="flex flex-col items-center"><Button size="lg" className="min-h-11 px-6" onClick={() => router.push("/dashboard")}>Continue Learning <ArrowRight /></Button></div>
  </div>;
}
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-white/80 p-3 dark:bg-neutral-900/70"><p className="text-xs text-neutral-500">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>; }
function ResultSkeleton() { return <div className="mx-auto max-w-3xl space-y-6" role="status" aria-label="Loading lesson result"><Skeleton className="h-72 rounded-2xl" /><Skeleton className="h-80 rounded-2xl" /><span className="sr-only">Loading lesson result…</span></div>; }
