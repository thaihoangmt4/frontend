"use client";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useLearningHistory } from "../hooks";

const PAGE_SIZE = 10;
export function LearningHistoryPage() {
  const [page, setPage] = useState(1);
  const query = useLearningHistory(page, PAGE_SIZE);
  const router = useRouter();
  if (query.isPending) return <HistorySkeleton />;
  if (query.isError || !query.data) return <EmptyState icon={BookOpen} headingLevel={1} title="We couldn’t load your history" description="Please try again in a moment." action={{ label: "Try again", onClick: () => query.refetch() }} />;
  const pages = Math.max(1, Math.ceil(query.data.totalCount / query.data.pageSize));
  return <div className="mx-auto max-w-4xl space-y-7">
    <header><h1 className="text-3xl font-bold tracking-tight">Learning History</h1><p className="mt-2 text-sm text-neutral-500">Review completed results or continue your backend-selected active session.</p></header>
    {query.data.items.length === 0 ? <div className="rounded-2xl border bg-white dark:bg-neutral-900"><EmptyState icon={BookOpen} title="No lesson attempts yet" description="Your learning activity will appear here after your first session." /></div> : <div className="space-y-3">{query.data.items.map((item) => {
      const date = item.completedAt ?? item.lastAccessedAt ?? item.startedAt;
      return <article key={item.lessonAttemptId} className="flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center dark:bg-neutral-900">
        <div className="min-w-0 flex-1"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === "Completed" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300" : "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"}`}>{item.status}</span><h2 className="mt-2 font-semibold">{item.lessonTitle}</h2><p className="mt-1 text-xs text-neutral-500">{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(date))} · {item.completedActivityCount}/{item.totalActivityCount} activities</p></div>
        {item.status === "Completed" ? <Button variant="outline" render={<Link href={`/lesson-attempts/${item.lessonAttemptId}/result`} />}>View result <ArrowRight /></Button> : <Button onClick={() => router.push("/dashboard")}>Continue <ArrowRight /></Button>}
      </article>;
    })}</div>}
    {query.data.totalCount > PAGE_SIZE && <nav aria-label="History pages" className="flex items-center justify-between"><Button variant="outline" disabled={page === 1 || query.isFetching} onClick={() => setPage((value) => value - 1)}>Previous</Button><span className="text-sm text-neutral-500">Page {page} of {pages}</span><Button variant="outline" disabled={page >= pages || query.isFetching} onClick={() => setPage((value) => value + 1)}>Next</Button></nav>}
  </div>;
}
function HistorySkeleton() { return <div className="mx-auto max-w-4xl space-y-4" role="status" aria-label="Loading learning history"><Skeleton className="h-20 w-full" />{[1,2,3,4].map((x) => <Skeleton key={x} className="h-28 rounded-2xl" />)}<span className="sr-only">Loading learning history…</span></div>; }
