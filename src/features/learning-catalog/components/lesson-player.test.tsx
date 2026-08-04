import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, vi } from "vitest";
import { LessonPlayer } from "./lesson-player";
import { instructionStep, questionStep } from "../test-fixtures";
import type { LessonLearningFlowResponse } from "../learning.types";

const { mutateAsync, reset, push, back } = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  reset: vi.fn(),
  push: vi.fn(),
  back: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push, back }) }));
vi.mock("../use-learning-image-preload", () => ({ useLearningImagePreload: vi.fn() }));
vi.mock("../use-learning-image", () => ({
  useLearningImage: () => ({ image: null, isLoading: false, isUnavailable: true }),
}));
vi.mock("../learning.hooks", async (importOriginal) => {
  const original = await importOriginal<typeof import("../learning.hooks")>();
  return {
    ...original,
    useEvaluateQuestionMutation: () => ({ mutateAsync, reset }),
  };
});

function flow(steps: LessonLearningFlowResponse["steps"]): LessonLearningFlowResponse {
  return {
    lesson: {
      id: "11111111-1111-4111-8111-111111111111",
      title: "Basic Fruits",
      description: null,
      difficultyLevel: "Beginner",
      estimatedDurationMinutes: 10,
      totalSteps: steps.length,
    },
    steps,
  };
}

describe("LessonPlayer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutateAsync.mockResolvedValue({
      questionId: "question-textMultipleChoice",
      isCorrect: true,
      correctAnswer: { optionId: "option-1", text: "apple" },
      explanation: "Apple is correct.",
    });
  });

  it("advances an instruction, completes, and restarts", async () => {
    const user = userEvent.setup();
    render(<LessonPlayer learningFlow={flow([instructionStep()])} />);
    await user.click(screen.getByRole("button", { name: "Finish" }));
    expect(screen.getByRole("heading", { name: "Lesson complete" })).toBeInTheDocument();
    expect(screen.getByText("0 / 0")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Restart lesson/i }));
    expect(screen.getByRole("heading", { name: "apple" })).toBeInTheDocument();
  });

  it("submits a choice, renders feedback, and completes with a score", async () => {
    const user = userEvent.setup();
    render(<LessonPlayer learningFlow={flow([questionStep()])} />);
    const check = screen.getByRole("button", { name: "Check" });
    expect(check).toBeDisabled();
    await user.click(screen.getByRole("radio", { name: "apple" }));
    expect(check).toBeEnabled();
    await user.click(check);
    expect(await screen.findByText("Correct!")).toBeInTheDocument();
    expect(mutateAsync).toHaveBeenCalledWith({
      lessonId: "11111111-1111-4111-8111-111111111111",
      questionId: "question-textMultipleChoice",
      request: { selectedOptionId: "option-1", textAnswer: null },
    });
    await user.click(screen.getByRole("button", { name: "Finish" }));
    expect(screen.getByText("1 / 1")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("prevents duplicate submissions while a request is pending", async () => {
    mutateAsync.mockImplementation(() => new Promise(() => {}));
    const user = userEvent.setup();
    render(<LessonPlayer learningFlow={flow([questionStep()])} />);
    await user.click(screen.getByRole("radio", { name: "apple" }));
    const check = screen.getByRole("button", { name: "Check" });
    await user.dblClick(check);
    expect(mutateAsync).toHaveBeenCalledOnce();
  });

  it("keeps the answer and shows an inline retry error after failure", async () => {
    mutateAsync.mockRejectedValue(new Error("offline"));
    const user = userEvent.setup();
    render(<LessonPlayer learningFlow={flow([questionStep()])} />);
    await user.click(screen.getByRole("radio", { name: "orange" }));
    await user.click(screen.getByRole("button", { name: "Check" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Your answer is still selected");
    expect(screen.getByRole("radio", { name: "orange. Selected" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("button", { name: "Check" })).toBeEnabled();
  });
});
