import { act, renderHook } from "@testing-library/react";
import { instructionStep, questionStep } from "./test-fixtures";
import { useLessonPlayer } from "./use-lesson-player";

describe("useLessonPlayer", () => {
  it("starts at zero and resets step-local state when advancing", () => {
    const steps = [questionStep(), instructionStep("step-2")];
    const { result } = renderHook(() => useLessonPlayer(steps));
    expect(result.current.state.currentStepIndex).toBe(0);

    act(() => result.current.selectOption("option-1"));
    act(() => result.current.submitStarted());
    act(() =>
      result.current.setEvaluationResult({
        questionId: "question-textMultipleChoice",
        isCorrect: true,
        correctAnswer: { optionId: "option-1", text: "apple" },
        explanation: null,
      }),
    );
    act(() => result.current.continueAfterFeedback());

    expect(result.current.state.currentStepIndex).toBe(1);
    expect(result.current.state.answerDraft).toEqual({ selectedOptionId: null, textAnswer: "" });
    expect(result.current.state.feedback).toBeNull();
    expect(result.current.state.answeredQuestionCount).toBe(1);
    expect(result.current.state.correctAnswerCount).toBe(1);
  });

  it("preserves an answer on failure and permits a retry", () => {
    const { result } = renderHook(() => useLessonPlayer([questionStep()]));
    act(() => result.current.selectOption("option-2"));
    act(() => result.current.submitStarted());
    act(() => result.current.setEvaluationError("Try again"));
    expect(result.current.state.answerDraft.selectedOptionId).toBe("option-2");
    expect(result.current.state.phase).toBe("answering");
    expect(result.current.state.answeredQuestionCount).toBe(0);
    act(() => result.current.submitStarted());
    expect(result.current.state.phase).toBe("submitting");
  });

  it("counts one successful evaluation only once", () => {
    const { result } = renderHook(() => useLessonPlayer([questionStep()]));
    const response = {
      questionId: "question-textMultipleChoice",
      isCorrect: false,
      correctAnswer: { optionId: "option-1", text: "apple" },
      explanation: null,
    };
    act(() => result.current.selectOption("option-2"));
    act(() => result.current.submitStarted());
    act(() => result.current.setEvaluationResult(response));
    act(() => result.current.setEvaluationResult(response));
    expect(result.current.state.answeredQuestionCount).toBe(1);
    expect(result.current.state.correctAnswerCount).toBe(0);
  });

  it("completes after the final instruction and restarts cleanly", () => {
    const { result } = renderHook(() => useLessonPlayer([instructionStep()]));
    act(() => result.current.continueInstruction());
    expect(result.current.state.phase).toBe("completed");
    act(() => result.current.restartLesson());
    expect(result.current.state).toMatchObject({
      currentStepIndex: 0,
      phase: "learning",
      answeredQuestionCount: 0,
      correctAnswerCount: 0,
      evaluationError: null,
      feedback: null,
    });
  });
});
