"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  useCompleteLessonMutation,
  useSubmitAnswerMutation,
} from "../hooks";
import { useLessonExitGuard } from "../use-lesson-exit-guard";
import { useLessonSession } from "../use-lesson-session";
import type {
  ExerciseAnswer,
  LessonSessionLesson,
  LessonExercise,
} from "../types";
import { AnswerFeedbackPanel } from "./answer-feedback-panel";
import { ExerciseInput } from "./exercise-input";
import { ExitLessonDialog } from "./exit-lesson-dialog";
import { LessonHeader } from "./lesson-header";

const HOME_HREF = "/dashboard";

export function LessonSession({
  lesson,
  exercises,
}: {
  lesson: LessonSessionLesson;
  exercises: LessonExercise[];
}) {
  const router = useRouter();
  const session = useLessonSession(lesson.id, exercises);
  const submit = useSubmitAnswerMutation();
  const complete = useCompleteLessonMutation(lesson.id);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const { phase, currentExercise, finishCompletion } = session;

  const requestExit = useCallback((href: string) => {
    setPendingHref(href);
    setExitDialogOpen(true);
  }, []);

  useLessonExitGuard(session.isActive, requestExit);

  const runCompletion = useCallback(() => {
    complete.mutate(undefined, { onSuccess: () => finishCompletion() });
  }, [complete, finishCompletion]);

  useEffect(() => {
    if (phase !== "completing") return;
    if (complete.isPending || complete.isError || complete.isSuccess) return;
    runCompletion();
  }, [complete.isError, complete.isPending, complete.isSuccess, phase, runCompletion]);

  async function answer(value: ExerciseAnswer) {
    if (!currentExercise || submit.isPending) return;
    try {
      const result = await submit.mutateAsync({
        exerciseId: currentExercise.exerciseId,
        exerciseVersion: currentExercise.version,
        answer: value,
      });
      session.registerAnswer(result);
    } catch {
      // The error message stays rendered below the exercise for a retry.
    }
  }

  function continueSession() {
    submit.reset();
    session.continueSession();
  }

  function leaveLesson() {
    session.abandon();
    setExitDialogOpen(false);
    router.push(pendingHref ?? HOME_HREF);
  }

  if (phase === "intro") {
    return (
      <>
        <LessonIntro
          title={lesson.title}
          objective={lesson.learningObjectiveSummary ?? lesson.description}
          exerciseCount={exercises.length}
          onStart={session.start}
        />
      </>
    );
  }

  if (phase === "completed") {
    return (
      <LessonComplete
        title={lesson.title}
        exerciseCount={exercises.length}
        onContinue={() => router.push(HOME_HREF)}
      />
    );
  }

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-neutral-900">
      <LessonHeader
        position={session.progressPosition}
        total={session.coreCount}
        isReview={phase === "review" || phase === "review-intro"}
        onExit={() => requestExit(HOME_HREF)}
      />

      <main className="flex-1 p-5 sm:p-8">
        {phase === "review-intro" && (
          <ReviewIntro
            count={session.reviewCount}
            onContinue={continueSession}
          />
        )}

        {phase === "completing" && (
          <CompletionPending
            failed={complete.isError}
            pending={complete.isPending}
            onRetry={runCompletion}
          />
        )}

        {(phase === "learning" || phase === "review") && currentExercise && (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                {currentExercise.instruction}
              </p>
              <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                {currentExercise.title}
              </h1>
            </div>

            {session.state.feedback ? (
              <AnswerFeedbackPanel
                feedback={session.state.feedback}
                onContinue={continueSession}
              />
            ) : (
              <ExerciseInput
                key={`${phase}-${currentExercise.exerciseId}`}
                exercise={currentExercise}
                disabled={submit.isPending}
                onAnswer={answer}
              />
            )}

            {submit.isPending && (
              <p className="text-sm text-neutral-500" role="status">
                Checking your answer…
              </p>
            )}
            {submit.isError && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200"
              >
                We couldn’t check that answer. Your response is still here—please
                try again.
              </p>
            )}
          </div>
        )}
      </main>

      <ExitLessonDialog
        open={exitDialogOpen}
        onOpenChange={(open) => {
          setExitDialogOpen(open);
          if (!open) setPendingHref(null);
        }}
        onLeave={leaveLesson}
      />
    </section>
  );
}

function LessonIntro({
  title,
  objective,
  exerciseCount,
  onStart,
}: {
  title: string;
  objective: string | null;
  exerciseCount: number;
  onStart: () => void;
}) {
  return (
    <section className="mx-auto w-full max-w-2xl rounded-2xl border bg-white p-6 shadow-sm sm:p-8 dark:bg-neutral-900">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      {objective && (
        <p className="mt-3 text-sm leading-6 text-neutral-500">{objective}</p>
      )}
      <p className="mt-5 text-sm font-medium">{exerciseCount} exercises</p>
      <Button
        size="lg"
        className="mt-6 min-h-11 w-full px-6 sm:w-auto"
        onClick={onStart}
      >
        Start <ArrowRight />
      </Button>
    </section>
  );
}

function ReviewIntro({
  count,
  onContinue,
}: {
  count: number;
  onContinue: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl text-center">
      <RotateCcw className="mx-auto size-8 text-blue-600" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-bold">Let’s review</h1>
      <p className="mt-2 text-sm text-neutral-500">
        You have {count} {count === 1 ? "question" : "questions"} to review.
      </p>
      <Button
        size="lg"
        className="mt-6 min-h-11 w-full px-6 sm:w-auto"
        onClick={onContinue}
      >
        Continue <ArrowRight />
      </Button>
    </div>
  );
}

function CompletionPending({
  failed,
  pending,
  onRetry,
}: {
  failed: boolean;
  pending: boolean;
  onRetry: () => void;
}) {
  if (failed) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-xl font-bold">We couldn’t save your progress.</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Your lesson is still here. Check your connection and try again.
        </p>
        <Button
          size="lg"
          className="mt-6 min-h-11 px-6"
          disabled={pending}
          onClick={onRetry}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-40 items-center justify-center gap-2 text-sm text-neutral-500"
      role="status"
    >
      <LoaderCircle className="animate-spin" aria-hidden="true" />
      Saving your progress…
    </div>
  );
}

function LessonComplete({
  title,
  exerciseCount,
  onContinue,
}: {
  title: string;
  exerciseCount: number;
  onContinue: () => void;
}) {
  return (
    <section className="mx-auto w-full max-w-2xl rounded-2xl border bg-white p-8 text-center shadow-sm dark:bg-neutral-900">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <CheckCircle2 className="size-7" aria-hidden="true" />
      </div>
      <h1 className="mt-5 text-2xl font-bold">Lesson complete!</h1>
      <p className="mt-2 text-neutral-500">{title}</p>
      <p className="mt-1 text-sm text-neutral-500">
        You finished all {exerciseCount} exercises.
      </p>
      <Button
        size="lg"
        className="mt-6 min-h-11 w-full px-6 sm:w-auto"
        onClick={onContinue}
      >
        Continue <ArrowRight />
      </Button>
    </section>
  );
}
