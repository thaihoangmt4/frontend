"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import type { EvaluateQuestionResponse } from "../learning.types";

export function AnswerFeedback({ feedback }: { feedback: EvaluateQuestionResponse }) {
  return (
    <div
      aria-live="polite"
      className={
        feedback.isCorrect
          ? "rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
          : "rounded-xl border border-red-200 bg-red-50 p-4 text-red-950 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100"
      }
    >
      <div className="flex gap-3">
        {feedback.isCorrect ? (
          <CheckCircle2 aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <XCircle aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 text-red-600 dark:text-red-400" />
        )}
        <div>
          <p className="font-bold">{feedback.isCorrect ? "Correct!" : "Not quite."}</p>
          {!feedback.isCorrect && (
            <p className="mt-1 text-sm">
              Correct answer: {feedback.correctAnswer.text || "See the highlighted answer above."}
            </p>
          )}
          {feedback.explanation && (
            <p className="mt-2 text-sm leading-relaxed opacity-90">{feedback.explanation}</p>
          )}
        </div>
      </div>
    </div>
  );
}
