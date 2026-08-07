"use client";
import { ArrowRight, BookOpen, CheckCircle2, LoaderCircle, Route } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAttempt } from "@/features/exercise-player/hooks";
import { useContinueLearning, useLearningProgress, useLearningSession } from "../hooks";

export function HomeContinueLearning() {
  const router = useRouter();
  const state = useContinueLearning();
  const progress = useLearningProgress();
  const session = useLearningSession();
  const attempt = useAttempt(state.data?.state === "Resume" ? state.data.lessonAttemptId ?? "" : "");
  if (state.isPending) return <Skeleton className="h-72 rounded-2xl" />;
  if (state.isError || !state.data) return <ErrorCard retry={() => state.refetch()} pending={state.isFetching} />;

  const courseTitle = progress.data?.course?.courseTitle ?? "Your learning path";
  const lesson = state.data.nextLesson;
  const completedCount = attempt.data?.attempt.completedActivityCount ?? 0;
  const totalCount = attempt.data?.attempt.totalActivityCount ?? 0;
  const percent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  async function begin() {
    const data = await session.mutateAsync();
    router.push(`/learn/${data.session.attempt.id}`);
  }
  if (state.data.state === "CourseCompleted") return (
    <Card icon={CheckCircle2} eyebrow="Course complete" title={courseTitle} description="You’ve reached the end of your assigned course. Take a moment to enjoy the progress you’ve made.">
      <Button size="lg" className="mt-6 min-h-11 px-5" onClick={() => router.push("/progress")}>View Learning Progress <ArrowRight /></Button>
    </Card>
  );
  if (state.data.state === "NoActiveAssignment") return (
    <Card icon={Route} eyebrow="Learning path" title="Your path hasn’t been assigned yet" description="There’s nothing you need to choose. Once your learning path is ready, it will appear here automatically." />
  );
  const resume = state.data.state === "Resume";
  return (
    <Card icon={BookOpen} eyebrow={resume ? "Ready to continue" : "Up next"} title={lesson?.title ?? courseTitle}
      description={`${courseTitle}${lesson?.unitTitle ? ` · ${lesson.unitTitle}` : ""}`}>
      {resume && totalCount > 0 && <div className="mt-5" aria-label={`${completedCount} of ${totalCount} activities completed`}>
        <div className="mb-2 flex justify-between text-xs font-medium text-blue-100"><span>Activity progress</span><span>{completedCount} / {totalCount}</span></div>
        <div className="h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-white" style={{ width: `${percent}%` }} /></div>
      </div>}
      {!resume && lesson && <p className="mt-4 text-sm text-blue-100">About {lesson.estimatedDurationMinutes} minutes</p>}
      <Button size="lg" className="mt-6 min-h-11 bg-white px-5 text-blue-700 hover:bg-blue-50" disabled={session.isPending} onClick={begin}>
        {session.isPending ? <><LoaderCircle className="animate-spin" />Preparing your session…</> : <>{resume ? "Continue Learning" : "Start Learning"}<ArrowRight /></>}
      </Button>
      {session.isError && <p className="mt-4 text-sm text-red-100" role="alert">We couldn’t open your session. Please try again.</p>}
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
