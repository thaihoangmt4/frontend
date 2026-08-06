"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  RotateCcw,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { getEvaluationErrorMessage } from "../errors";
import { useEvaluateQuestionMutation } from "../learning.hooks";
import type {
  EvaluateQuestionRequest,
  LessonLearningFlowResponse,
  QuestionStep,
} from "../learning.types";
import { useLessonPlayer } from "../use-lesson-player";
import { AnswerFeedback } from "./answer-feedback";
import { LearningStepRenderer } from "./learning-step-renderer";

export function LessonPlayer({
  learningFlow,
}: {
  learningFlow: LessonLearningFlowResponse;
}) {
  const router = useRouter();
  const player = useLessonPlayer(learningFlow.steps);
  const evaluationMutation = useEvaluateQuestionMutation();
  const submissionInFlightRef = useRef(false);
  const stepContentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (player.state.currentStepIndex > 0) stepContentRef.current?.focus();
  }, [player.state.currentStepIndex]);

  async function submitAnswer() {
    const question = player.currentStep.question;
    if (
      player.currentStep.type !== "question" ||
      !question ||
      player.state.phase !== "answering" ||
      submissionInFlightRef.current ||
      !hasValidAnswer(question, player.state.answerDraft)
    ) {
      return;
    }

    submissionInFlightRef.current = true;
    player.submitStarted();

    try {
      const result = await evaluationMutation.mutateAsync({
        lessonId: learningFlow.lesson.id,
        questionId: question.id,
        request: createEvaluationRequest(question, player.state.answerDraft),
      });
      player.setEvaluationResult(result);
    } catch (error) {
      player.setEvaluationError(getEvaluationErrorMessage(error));
    } finally {
      submissionInFlightRef.current = false;
    }
  }

  function continueToNextStep() {
    evaluationMutation.reset();
    if (player.state.phase === "feedback") {
      player.continueAfterFeedback();
    } else {
      player.continueInstruction();
    }
  }

  function restartLesson() {
    evaluationMutation.reset();
    submissionInFlightRef.current = false;
    player.restartLesson();
  }

  if (player.state.phase === "completed") {
    return (
      <section
        className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
        aria-labelledby="lesson-complete-heading"
      >
        <div className="max-w-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <BookOpen aria-hidden="true" className="h-8 w-8" />
          </div>
          <h1
            id="lesson-complete-heading"
            className="mt-5 text-2xl font-bold text-neutral-900 dark:text-neutral-100"
          >
            Lesson complete
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            You reached the end of {learningFlow.lesson.title}.
          </p>
          <CompletionScore
            answeredCount={player.state.answeredQuestionCount}
            correctCount={player.state.correctAnswerCount}
          />
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.push("/courses")}
            >
              Back to courses
            </Button>
            <Button type="button" size="lg" onClick={restartLesson}>
              <RotateCcw aria-hidden="true" /> Restart lesson
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="mx-auto flex min-h-[70vh] max-w-4xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
      aria-labelledby="lesson-player-heading"
    >
      <LessonPlayerHeader
        currentStep={player.state.currentStepIndex + 1}
        totalSteps={learningFlow.steps.length}
        progress={player.progress}
        isSubmitting={player.state.phase === "submitting"}
        onLeave={() => router.back()}
      />
      <main
        ref={stepContentRef}
        tabIndex={-1}
        className="flex flex-1 items-center justify-center px-5 py-10 outline-none sm:px-10"
      >
        <LearningStepRenderer
          step={player.currentStep}
          selectedOptionId={player.state.answerDraft.selectedOptionId}
          textAnswer={player.state.answerDraft.textAnswer}
          disabled={
            player.state.phase === "submitting" ||
            player.state.phase === "feedback"
          }
          feedback={player.state.feedback}
          onSelectOption={player.selectOption}
          onTextAnswerChange={player.setTextAnswer}
          onSubmit={submitAnswer}
          errorMessageId={
            player.state.evaluationError ? "evaluation-error" : undefined
          }
        />
      </main>
      <LessonPlayerFooter
        isQuestion={isEvaluableQuestion(player.currentStep.question)}
        isLastStep={
          player.state.currentStepIndex === learningFlow.steps.length - 1
        }
        phase={player.state.phase}
        canSubmit={
          player.currentStep.question
            ? hasValidAnswer(
                player.currentStep.question,
                player.state.answerDraft,
              )
            : false
        }
        feedback={player.state.feedback}
        evaluationError={player.state.evaluationError}
        onContinue={continueToNextStep}
        onSubmit={submitAnswer}
      />
    </section>
  );
}

function LessonPlayerHeader({
  currentStep,
  totalSteps,
  progress,
  isSubmitting,
  onLeave,
}: {
  currentStep: number;
  totalSteps: number;
  progress: number;
  isSubmitting: boolean;
  onLeave: () => void;
}) {
  return (
    <header className="flex items-center gap-4 border-b border-neutral-100 px-4 py-4 sm:px-6 dark:border-neutral-800">
      <AlertDialog.Root>
        <AlertDialog.Trigger
          aria-label="Exit lesson"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-neutral-500 outline-none transition hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-3 focus-visible:ring-blue-500/30 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px]" />
          <AlertDialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <AlertDialog.Popup className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl outline-none dark:bg-neutral-900">
              <AlertDialog.Title className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Leave this lesson?
              </AlertDialog.Title>
              <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                {isSubmitting
                  ? "Please wait while your answer is being checked. Your current progress is not saved yet."
                  : "Your current progress will not be saved."}
              </AlertDialog.Description>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <AlertDialog.Close className="inline-flex h-11 items-center justify-center rounded-lg border border-neutral-200 px-4 text-sm font-medium outline-none hover:bg-neutral-50 focus-visible:ring-3 focus-visible:ring-blue-500/30 dark:border-neutral-700 dark:hover:bg-neutral-800">
                  Keep learning
                </AlertDialog.Close>
                <AlertDialog.Close
                  disabled={isSubmitting}
                  onClick={onLeave}
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-medium text-white outline-none hover:bg-red-700 focus-visible:ring-3 focus-visible:ring-red-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Leave lesson
                </AlertDialog.Close>
              </div>
            </AlertDialog.Popup>
          </AlertDialog.Viewport>
        </AlertDialog.Portal>
      </AlertDialog.Root>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          <span>Lesson progress</span>
          <span>
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label={`Lesson progress: step ${currentStep} of ${totalSteps}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="h-3 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"
        >
          <div
            className="h-full rounded-full bg-blue-600 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </header>
  );
}

function LessonPlayerFooter({
  isQuestion,
  isLastStep,
  phase,
  canSubmit,
  feedback,
  evaluationError,
  onContinue,
  onSubmit,
}: {
  isQuestion: boolean;
  isLastStep: boolean;
  phase: "learning" | "answering" | "submitting" | "feedback" | "completed";
  canSubmit: boolean;
  feedback: import("../learning.types").EvaluateQuestionResponse | null;
  evaluationError: string | null;
  onContinue: () => void;
  onSubmit: () => void;
}) {
  const isSubmitting = phase === "submitting";
  const hasFeedback = phase === "feedback" && feedback !== null;
  const shouldContinue = !isQuestion || hasFeedback;
  const actionLabel = isSubmitting
    ? "Checking..."
    : shouldContinue
      ? isLastStep
        ? "Finish"
        : "Continue"
      : "Check";

  return (
    <footer className="sticky bottom-0 border-t border-neutral-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6 dark:border-neutral-800 dark:bg-neutral-900/95">
      <div className="mx-auto max-w-2xl">
        {hasFeedback && <AnswerFeedback feedback={feedback} />}
        {evaluationError && (
          <div
            id="evaluation-error"
            role="alert"
            className="mb-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"
          >
            <AlertTriangle
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0"
            />
            <span>{evaluationError} Your answer is still selected.</span>
          </div>
        )}
        <div className={`flex justify-end ${hasFeedback ? "mt-4" : ""}`}>
          <Button
            type="button"
            size="lg"
            className="min-h-11 min-w-32"
            onClick={shouldContinue ? onContinue : onSubmit}
            disabled={!shouldContinue && (!canSubmit || isSubmitting)}
          >
            {actionLabel}
            {shouldContinue && <ArrowRight aria-hidden="true" />}
          </Button>
        </div>
      </div>
    </footer>
  );
}

function CompletionScore({
  answeredCount,
  correctCount,
}: {
  answeredCount: number;
  correctCount: number;
}) {
  const accuracy =
    answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : null;
  return (
    <dl className="my-6 grid grid-cols-2 gap-3">
      <div className="rounded-xl bg-neutral-100 p-4 dark:bg-neutral-800">
        <dt className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          Correct answers
        </dt>
        <dd className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {correctCount} / {answeredCount}
        </dd>
      </div>
      <div className="rounded-xl bg-neutral-100 p-4 dark:bg-neutral-800">
        <dt className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          Accuracy
        </dt>
        <dd className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {accuracy === null ? "—" : `${accuracy}%`}
        </dd>
      </div>
    </dl>
  );
}

function isEvaluableQuestion(
  question: QuestionStep | null,
): question is QuestionStep {
  if (!question) return false;
  switch (question.type) {
    case "textInput":
      return true;
    case "textMultipleChoice":
    case "imageMultipleChoice":
    case "audioMultipleChoice":
      return question.options.length > 0;
    default:
      return false;
  }
}

function hasValidAnswer(
  question: QuestionStep,
  answerDraft: { selectedOptionId: string | null; textAnswer: string },
): boolean {
  return question.type === "textInput"
    ? answerDraft.textAnswer.trim().length > 0
    : question.options.length > 0 && answerDraft.selectedOptionId !== null;
}

function createEvaluationRequest(
  question: QuestionStep,
  answerDraft: { selectedOptionId: string | null; textAnswer: string },
): EvaluateQuestionRequest {
  return question.type === "textInput"
    ? { selectedOptionId: null, textAnswer: answerDraft.textAnswer }
    : { selectedOptionId: answerDraft.selectedOptionId, textAnswer: null };
}
