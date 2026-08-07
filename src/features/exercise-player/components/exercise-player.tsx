"use client";
import axios from "axios";
import {
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSubmitActivity } from "../hooks";
import { useLearningSession } from "@/features/learning-progress/hooks";
import type {
  ExerciseAnswer,
  LessonAttemptPlayerResponse,
  SubmitActivityAnswerResponse,
} from "../types";
import { ExerciseInput } from "./exercise-input";

export function ExercisePlayer({
  initialAttempt,
}: {
  initialAttempt: LessonAttemptPlayerResponse;
}) {
  const router = useRouter();
  const submit = useSubmitActivity(initialAttempt.attempt.id);
  const startNext = useLearningSession();
  const [attempt, setAttempt] = useState(initialAttempt);
  const [activityId, setActivityId] = useState(
    initialAttempt.attempt.currentActivityId ??
      initialAttempt.activities[0]?.activityId,
  );
  const [feedback, setFeedback] = useState<SubmitActivityAnswerResponse | null>(
    null,
  );
  const [submissionId, setSubmissionId] = useState(() => crypto.randomUUID());
  const activity = useMemo(
    () => attempt.activities.find((x) => x.activityId === activityId),
    [attempt, activityId],
  );
  const completed =
    attempt.attempt.status === "Completed" ||
    (feedback === null &&
      attempt.attempt.completedActivityCount >=
        attempt.attempt.totalActivityCount);
  async function answer(value: ExerciseAnswer) {
    if (!activity || submit.isPending) return;
    try {
      const result = await submit.mutateAsync({
        activityId: activity.activityId,
        exerciseVersion: activity.exerciseVersion,
        submissionId,
        answer: value,
      });
      setFeedback(result);
      setAttempt((old) => ({
        ...old,
        attempt: {
          ...old.attempt,
          completedActivityCount: result.progress.completedActivityCount,
          totalActivityCount: result.progress.totalActivityCount,
          status: old.attempt.status,
        },
      }));
    } catch {}
  }
  function advance() {
    if (!feedback) return;
    const nextId = feedback.progress.nextActivityId;
    setFeedback(null);
    submit.reset();
    setSubmissionId(crypto.randomUUID());
    if (nextId) setActivityId(nextId);
  }
  async function continueLearning() {
    try {
      const next = await startNext.mutateAsync();
      router.replace(`/learn/${next.session.attempt.id}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409)
        router.replace("/progress");
    }
  }
  if (completed)
    return (
      <Completion
        title={attempt.lesson.title}
        correct={
          attempt.attempt.correctCount +
          (feedback?.evaluation.status === "Correct" ? 1 : 0)
        }
        total={attempt.attempt.totalActivityCount}
        pending={startNext.isPending}
        onContinue={continueLearning}
      />
    );
  if (!activity)
    return (
      <div className="rounded-xl border p-6">
        No current activity was found.{" "}
        <Button variant="link" onClick={() => router.push("/dashboard")}>
          Return home
        </Button>
      </div>
    );
  const progress = Math.round(
    (attempt.attempt.completedActivityCount /
      Math.max(attempt.attempt.totalActivityCount, 1)) *
      100,
  );
  return (
    <section className="mx-auto max-w-4xl overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-neutral-900">
      <header className="border-b p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
              {activity.activityType === "Review" && (
                <RotateCcw className="size-3.5" />
              )}
              {activity.activityType} activity
            </div>
            <h1 className="text-xl font-bold">{attempt.lesson.title}</h1>
          </div>
          <span className="text-sm text-neutral-500">
            {attempt.attempt.completedActivityCount} /{" "}
            {attempt.attempt.totalActivityCount}
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div
            className="h-full bg-blue-600"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>
      <main className="min-h-[420px] p-6 sm:p-10">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-medium text-neutral-500">
            {activity.instruction}
          </p>
          <h2 className="mt-2 mb-7 text-2xl font-bold">{activity.title}</h2>
          {feedback ? (
            <Feedback result={feedback} onContinue={advance} />
          ) : (
            <ExerciseInput
              key={activity.activityId}
              activity={activity}
              disabled={submit.isPending}
              onAnswer={answer}
            />
          )}{" "}
          {submit.isPending && (
            <p className="mt-4 text-sm text-neutral-500" role="status">
              Checking your answer…
            </p>
          )}
          {submit.isError && <ErrorMessage error={submit.error} />}
        </div>
      </main>
    </section>
  );
}
function Feedback({
  result,
  onContinue,
}: {
  result: SubmitActivityAnswerResponse;
  onContinue: () => void;
}) {
  const correct = result.evaluation.status === "Correct",
    partial = result.evaluation.status === "PartiallyCorrect";
  return (
    <div
      role="status"
      className={`rounded-2xl border p-6 ${correct ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20" : partial ? "border-amber-200 bg-amber-50 dark:bg-amber-950/20" : "border-red-200 bg-red-50 dark:bg-red-950/20"}`}
    >
      <div className="flex gap-3">
        {correct ? (
          <CheckCircle2 className="text-emerald-600" />
        ) : (
          <XCircle className={partial ? "text-amber-600" : "text-red-600"} />
        )}
        <div>
          <h3 className="font-bold">
            {correct
              ? "Correct!"
              : partial
                ? "Almost there"
                : result.evaluation.status === "NotEvaluated"
                  ? "Practice recorded"
                  : "Not quite"}
          </h3>
          {result.evaluation.feedback && (
            <p className="mt-1 text-sm">{result.evaluation.feedback}</p>
          )}
          {result.evaluation.explanation && (
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
              {result.evaluation.explanation}
            </p>
          )}
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button className="min-h-11" size="lg" onClick={onContinue}>
          Continue <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
function ErrorMessage({ error }: { error: unknown }) {
  const conflict = axios.isAxiosError(error) && error.response?.status === 409;
  return (
    <p
      role="alert"
      className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200"
    >
      {conflict
        ? "This activity changed or was already submitted differently. Reload the lesson to continue safely."
        : "We couldn’t submit that answer. Your response is still here—please try again."}
    </p>
  );
}
function Completion({
  title,
  correct,
  total,
  pending,
  onContinue,
}: {
  title: string;
  correct: number;
  total: number;
  pending: boolean;
  onContinue: () => void;
}) {
  return (
    <section className="mx-auto flex min-h-[65vh] max-w-3xl items-center justify-center rounded-2xl border bg-white p-8 text-center dark:bg-neutral-900">
      <div>
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Sparkles className="size-8" />
        </div>
        <h1 className="mt-5 text-3xl font-bold">Lesson complete</h1>
        <p className="mt-2 text-neutral-500">You completed {title}.</p>
        <div className="my-6 rounded-xl bg-neutral-100 p-4 dark:bg-neutral-800">
          <span className="text-sm text-neutral-500">Correct activities</span>
          <p className="text-2xl font-bold">
            {correct} / {total}
          </p>
        </div>
        <Button
          size="lg"
          className="min-h-11 px-5"
          disabled={pending}
          onClick={onContinue}
        >
          {pending ? "Finding your next lesson…" : "Continue learning"}
          <ArrowRight />
        </Button>
      </div>
    </section>
  );
}
