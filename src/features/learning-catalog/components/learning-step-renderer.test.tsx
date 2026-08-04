import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { LearningStepRenderer } from "./learning-step-renderer";
import { instructionStep, questionStep } from "../test-fixtures";
import type { LearningStep } from "../learning.types";

vi.mock("../use-learning-image", () => ({
  useLearningImage: () => ({ image: null, isLoading: false, isUnavailable: true }),
}));

const handlers = {
  selectedOptionId: null,
  textAnswer: "",
  disabled: false,
  feedback: null,
  onSelectOption: vi.fn(),
  onTextAnswerChange: vi.fn(),
  onSubmit: vi.fn(),
};

describe("LearningStepRenderer", () => {
  it("renders an instruction", () => {
    render(<LearningStepRenderer step={instructionStep()} {...handlers} />);
    expect(screen.getByRole("heading", { name: "apple" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Play pronunciation for apple" }),
    ).toBeInTheDocument();
  });

  it("renders a question", () => {
    render(<LearningStepRenderer step={questionStep()} {...handlers} />);
    expect(screen.getByRole("heading", { name: "Prompt for textMultipleChoice" })).toBeInTheDocument();
  });

  it("fails safely for an unsupported step type", () => {
    const unsupported = { ...instructionStep(), type: "futureStep" } as unknown as LearningStep;
    render(<LearningStepRenderer step={unsupported} {...handlers} />);
    expect(screen.getByRole("heading", { name: "Unsupported lesson content" })).toBeInTheDocument();
  });
});
