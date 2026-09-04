"use client";
import { ArrowRight, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLessonSessionQuery } from "@/features/lesson-session";

export function HomeContinueLearning() {
  const router = useRouter();
  const query = useLessonSessionQuery();
  if (query.isPending) return <Skeleton className="h-72 rounded-2xl" />;
  if (query.isError || !query.data) return <ErrorCard retry={() => query.refetch()} pending={query.isFetching} />;
  const lesson = query.data;
  return (
    <Card icon={BookOpen} eyebrow="Next lesson" title={lesson.title}
      description={lesson.topic ?? "Continue with your assigned learning path."}>
      <p className="mt-4 text-sm text-blue-100">{lesson.exercises.length} exercises</p>
      <Button size="lg" className="mt-6 min-h-11 bg-white px-5 text-blue-700 hover:bg-blue-50" onClick={() => router.push(`/learn/lessons/${lesson.lessonId}`)}>
        Start Lesson <ArrowRight />
      </Button>
    </Card>
  );
}

function Card({ icon: Icon, eyebrow, title, description, children }: { icon: typeof BookOpen; eyebrow: string; title: string; description: string; children?: React.ReactNode }) {
  return <section className="overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600 to-indigo-700 p-7 text-white shadow-sm">
    <Icon className="mb-5 size-9" aria-hidden="true" /><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">{eyebrow}</p>
    <h2 className="mt-2 text-2xl font-bold tracking-tight">{title}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">{description}</p>{children}
  </section>;
}
function ErrorCard({ retry, pending }: { retry: () => void; pending: boolean }) { return <section className="rounded-2xl border border-red-200 bg-white p-7 dark:border-red-900 dark:bg-neutral-900"><h2 className="font-semibold">We couldn’t load your learning path</h2><p className="mt-2 text-sm text-neutral-500">Check your connection and try again.</p><Button variant="outline" className="mt-5" disabled={pending} onClick={retry}>{pending ? "Trying again…" : "Try again"}</Button></section>; }
