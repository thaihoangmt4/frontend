import type { SubmitAnswerResponse } from "./types";

export type LessonSessionPhase =
  | "intro"
  | "learning"
  | "review-intro"
  | "review"
  | "completing"
  | "completed";

export type LessonSessionState = {
  lessonId: string;
  phase: LessonSessionPhase;
  /** Index into the core exercises, always bounded by the 10 unique exercises. */
  currentIndex: number;
  reviewQueue: string[];
  reviewIndex: number;
  /** Feedback for the exercise the learner just answered, if any. */
  feedback: SubmitAnswerResponse | null;
};
