"use client";

import { useCallback, useMemo, useReducer } from "react";
import type { EvaluateQuestionResponse, LearningStep } from "./learning.types";
import type {
  AnswerDraft,
  LessonPlayerPhase,
  LessonPlayerState,
} from "./lesson-player.types";

const EMPTY_ANSWER: AnswerDraft = {
  selectedOptionId: null,
  textAnswer: "",
};

type PlayerAction =
  | { type: "select-option"; optionId: string }
  | { type: "set-text-answer"; textAnswer: string }
  | { type: "submit-started" }
  | { type: "evaluation-succeeded"; result: EvaluateQuestionResponse }
  | { type: "evaluation-failed"; message: string }
  | { type: "advance"; nextPhase: LessonPlayerPhase; isLastStep: boolean }
  | { type: "restart"; initialPhase: LessonPlayerPhase };

function phaseForStep(step: LearningStep | undefined): LessonPlayerPhase {
  return step?.type === "question" ? "answering" : "learning";
}

function createInitialState(steps: LearningStep[]): LessonPlayerState {
  return {
    currentStepIndex: 0,
    phase: phaseForStep(steps[0]),
    answerDraft: EMPTY_ANSWER,
    feedback: null,
    evaluationError: null,
    answeredQuestionCount: 0,
    correctAnswerCount: 0,
  };
}

function reducer(
  state: LessonPlayerState,
  action: PlayerAction,
): LessonPlayerState {
  switch (action.type) {
    case "select-option":
      if (state.phase !== "answering") return state;
      return {
        ...state,
        phase: "answering",
        answerDraft: { selectedOptionId: action.optionId, textAnswer: "" },
        evaluationError: null,
      };
    case "set-text-answer":
      if (state.phase !== "answering") return state;
      return {
        ...state,
        phase: "answering",
        answerDraft: { selectedOptionId: null, textAnswer: action.textAnswer },
        evaluationError: null,
      };
    case "submit-started":
      if (state.phase !== "answering") return state;
      return { ...state, phase: "submitting", evaluationError: null };
    case "evaluation-succeeded":
      if (state.phase !== "submitting") return state;
      return {
        ...state,
        phase: "feedback",
        feedback: action.result,
        evaluationError: null,
        answeredQuestionCount: state.answeredQuestionCount + 1,
        correctAnswerCount:
          state.correctAnswerCount + (action.result.isCorrect ? 1 : 0),
      };
    case "evaluation-failed":
      if (state.phase !== "submitting") return state;
      return {
        ...state,
        phase: "answering",
        evaluationError: action.message,
      };
    case "advance":
      if (state.phase === "submitting" || state.phase === "completed") {
        return state;
      }
      if (action.isLastStep) return { ...state, phase: "completed" };
      return {
        ...state,
        currentStepIndex: state.currentStepIndex + 1,
        phase: action.nextPhase,
        answerDraft: EMPTY_ANSWER,
        feedback: null,
        evaluationError: null,
      };
    case "restart":
      return {
        ...createInitialState([]),
        phase: action.initialPhase,
      };
  }
}

export function useLessonPlayer(steps: LearningStep[]) {
  const [state, dispatch] = useReducer(reducer, steps, createInitialState);
  const currentStep = steps[state.currentStepIndex];
  const totalSteps = steps.length;
  const progress =
    state.phase === "completed"
      ? 100
      : Math.round(((state.currentStepIndex + 1) / totalSteps) * 100);

  const advance = useCallback(() => {
    const nextIndex = state.currentStepIndex + 1;
    dispatch({
      type: "advance",
      isLastStep: nextIndex >= steps.length,
      nextPhase: phaseForStep(steps[nextIndex]),
    });
  }, [state.currentStepIndex, steps]);

  return useMemo(
    () => ({
      state,
      currentStep,
      progress,
      selectOption: (optionId: string) =>
        dispatch({ type: "select-option", optionId }),
      setTextAnswer: (textAnswer: string) =>
        dispatch({ type: "set-text-answer", textAnswer }),
      submitStarted: () => dispatch({ type: "submit-started" }),
      setEvaluationResult: (result: EvaluateQuestionResponse) =>
        dispatch({ type: "evaluation-succeeded", result }),
      setEvaluationError: (message: string) =>
        dispatch({ type: "evaluation-failed", message }),
      continueInstruction: advance,
      continueAfterFeedback: advance,
      restartLesson: () =>
        dispatch({ type: "restart", initialPhase: phaseForStep(steps[0]) }),
    }),
    [advance, currentStep, progress, state, steps],
  );
}
