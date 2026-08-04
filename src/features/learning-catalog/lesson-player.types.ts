import type { EvaluateQuestionResponse } from "./learning.types";

export type LessonPlayerPhase =
  | "learning"
  | "answering"
  | "submitting"
  | "feedback"
  | "completed";

export type AnswerDraft = {
  selectedOptionId: string | null;
  textAnswer: string;
};

export type LessonPlayerState = {
  currentStepIndex: number;
  phase: LessonPlayerPhase;
  answerDraft: AnswerDraft;
  feedback: EvaluateQuestionResponse | null;
  evaluationError: string | null;
  answeredQuestionCount: number;
  correctAnswerCount: number;
};
