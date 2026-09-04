"use client";

import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SubmitAnswerResponse } from "../types";

export function AnswerFeedbackPanel({
  feedback,
  onContinue,
}: {
  feedback: SubmitAnswerResponse;
  onContinue: () => void;
}) {
  const correct = feedback.isCorrect;

  return (
    <div
      role="status"
      className={`rounded-2xl border p-5 sm:p-6 ${correct ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20" : "border-red-200 bg-red-50 dark:bg-red-950/20"}`}
    >
      <div className="flex gap-3">
        {correct ? (
          <CheckCircle2 className="text-emerald-600" aria-hidden="true" />
        ) : (
          <XCircle className="text-red-600" aria-hidden="true" />
        )}
        <div className="min-w-0">
          <h3 className="font-bold">{correct ? "Correct!" : "Not quite."}</h3>
          {feedback.feedback ? (
            <p className="mt-1 text-sm">{feedback.feedback}</p>
          ) : (
            correct && <p className="mt-1 text-sm">Nice work.</p>
          )}
          {!correct && feedback.correctAnswer && (
            <p className="mt-3 text-sm">
              <span className="font-semibold">Correct answer: </span>
              {formatCorrectAnswer(feedback.correctAnswer)}
            </p>
          )}
          {feedback.explanation && (
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
              <span className="font-semibold">Explanation: </span>
              {feedback.explanation}
            </p>
          )}
        </div>
      </div>
      <div className="mt-6">
        <Button
          size="lg"
          className="min-h-11 w-full px-5 sm:w-auto"
          onClick={onContinue}
        >
          Continue <ArrowRight />
        </Button>
      </div>
    </div>
  );
}

function formatCorrectAnswer(value: string | number | boolean | object): string {
  return typeof value === "string" ? value : JSON.stringify(value);
}
