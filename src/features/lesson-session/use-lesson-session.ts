"use client";

import { useCallback, useEffect, useMemo, useReducer } from "react";
import type {
  LessonSessionPhase,
  LessonSessionState,
} from "./lesson-session.types";
import {
  clearLessonSessionSnapshot,
  readLessonSessionSnapshot,
  writeLessonSessionSnapshot,
} from "./session-storage";
import type { LessonExercise, SubmitAnswerResponse } from "./types";

type SessionAction =
  | { type: "start" }
  | { type: "answered"; result: SubmitAnswerResponse }
  | { type: "continue"; coreCount: number }
  | { type: "completion-succeeded" };

function createInitialState(lessonId: string): LessonSessionState {
  return {
    lessonId,
    phase: "intro",
    currentIndex: 0,
    reviewQueue: [],
    reviewIndex: 0,
    feedback: null,
  };
}

function restoreState(
  lessonId: string,
  exercises: LessonExercise[],
): LessonSessionState {
  const snapshot = readLessonSessionSnapshot(lessonId);
  if (!snapshot) return createInitialState(lessonId);

  const knownIds = new Set(exercises.map((exercise) => exercise.exerciseId));
  const reviewQueue = snapshot.reviewQueue.filter((id) => knownIds.has(id));
  const currentIndex = Math.min(
    Math.max(snapshot.currentIndex, 0),
    Math.max(exercises.length - 1, 0),
  );
  const reviewIndex = Math.min(
    Math.max(snapshot.reviewIndex, 0),
    Math.max(reviewQueue.length, 0),
  );

  return { ...snapshot, currentIndex, reviewQueue, reviewIndex };
}

function reducer(
  state: LessonSessionState,
  action: SessionAction,
): LessonSessionState {
  switch (action.type) {
    case "start":
      if (state.phase !== "intro") return state;
      return { ...state, phase: "learning", currentIndex: 0, feedback: null };

    case "answered":
      if (state.phase !== "learning" && state.phase !== "review") return state;
      return { ...state, feedback: action.result };

    case "continue": {
      if (state.phase === "review-intro") {
        return { ...state, phase: "review", reviewIndex: 0, feedback: null };
      }

      if (state.phase === "learning") {
        if (!state.feedback) return state;
        const reviewQueue =
          state.feedback.isCorrect ||
          state.reviewQueue.includes(state.feedback.exerciseId)
            ? state.reviewQueue
            : [...state.reviewQueue, state.feedback.exerciseId];
        const nextIndex = state.currentIndex + 1;

        if (nextIndex < action.coreCount) {
          return {
            ...state,
            currentIndex: nextIndex,
            reviewQueue,
            feedback: null,
          };
        }

        return {
          ...state,
          currentIndex: state.currentIndex,
          reviewQueue,
          reviewIndex: 0,
          feedback: null,
          phase: reviewQueue.length > 0 ? "review-intro" : "completing",
        };
      }

      if (state.phase === "review") {
        if (!state.feedback) return state;
        const nextReviewIndex = state.reviewIndex + 1;
        // A review item is never requeued, so every lesson stays finite.
        return {
          ...state,
          reviewIndex: nextReviewIndex,
          feedback: null,
          phase:
            nextReviewIndex >= state.reviewQueue.length
              ? "completing"
              : "review",
        };
      }

      return state;
    }

    case "completion-succeeded":
      if (state.phase !== "completing") return state;
      return { ...state, phase: "completed", feedback: null };
  }
}

export type LessonSessionController = {
  state: LessonSessionState;
  phase: LessonSessionPhase;
  currentExercise: LessonExercise | undefined;
  /** 1-based position within the 10 unique exercises. */
  progressPosition: number;
  coreCount: number;
  reviewCount: number;
  isActive: boolean;
  start: () => void;
  registerAnswer: (result: SubmitAnswerResponse) => void;
  continueSession: () => void;
  finishCompletion: () => void;
  abandon: () => void;
};

export function useLessonSession(
  lessonId: string,
  exercises: LessonExercise[],
): LessonSessionController {
  const [state, dispatch] = useReducer(
    reducer,
    { lessonId, exercises },
    ({ lessonId: id, exercises: list }) => restoreState(id, list),
  );

  const coreCount = exercises.length;
  const isActive = state.phase !== "intro" && state.phase !== "completed";

  useEffect(() => {
    if (state.phase === "completed") return;
    writeLessonSessionSnapshot(state);
  }, [state]);

  const currentExercise = useMemo(() => {
    if (state.phase === "review") {
      const exerciseId = state.reviewQueue[state.reviewIndex];
      return exercises.find((exercise) => exercise.exerciseId === exerciseId);
    }
    return exercises[state.currentIndex];
  }, [exercises, state.currentIndex, state.phase, state.reviewIndex, state.reviewQueue]);

  const finishCompletion = useCallback(() => {
    clearLessonSessionSnapshot();
    dispatch({ type: "completion-succeeded" });
  }, []);

  const abandon = useCallback(() => {
    clearLessonSessionSnapshot();
  }, []);

  return {
    state,
    phase: state.phase,
    currentExercise,
    progressPosition: Math.min(state.currentIndex + 1, Math.max(coreCount, 1)),
    coreCount,
    reviewCount: state.reviewQueue.length,
    isActive,
    start: () => dispatch({ type: "start" }),
    registerAnswer: (result: SubmitAnswerResponse) =>
      dispatch({ type: "answered", result }),
    continueSession: () => dispatch({ type: "continue", coreCount }),
    finishCompletion,
    abandon,
  };
}
