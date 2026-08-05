import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { QuestionStepRenderer, type QuestionRendererProps } from "./question-step-renderer";
import { question } from "../test-fixtures";
import type { QuestionStep } from "../learning.types";

function renderQuestion(overrides: Partial<QuestionRendererProps> = {}) {
  const props: QuestionRendererProps = {
    question: question("textMultipleChoice"),
    selectedOptionId: null,
    textAnswer: "",
    disabled: false,
    feedback: null,
    onSelectOption: vi.fn(),
    onTextAnswerChange: vi.fn(),
    onSubmit: vi.fn(),
    ...overrides,
  };
  return { ...render(<QuestionStepRenderer {...props} />), props };
}

describe("QuestionStepRenderer", () => {
  it.each(["textMultipleChoice", "imageMultipleChoice", "audioMultipleChoice", "textInput"] as const)(
    "renders %s",
    (type) => {
      renderQuestion({ question: question(type) });
      expect(screen.getByRole("heading", { name: `Prompt for ${type}` })).toBeInTheDocument();
    },
  );

  it("handles an unsupported type safely", () => {
    const unsupported = { ...question("textInput"), type: "futureQuestion" } as unknown as QuestionStep;
    renderQuestion({ question: unsupported });
    expect(screen.getByText(/not supported by this version/i)).toBeInTheDocument();
  });

  it("emits selection changes and supports arrow-key selection", async () => {
    const user = userEvent.setup();
    const { props } = renderQuestion();
    const apple = screen.getByRole("radio", { name: "apple" });
    await user.click(apple);
    expect(props.onSelectOption).toHaveBeenCalledWith("option-1");
    apple.focus();
    await user.keyboard("{ArrowDown}");
    expect(props.onSelectOption).toHaveBeenLastCalledWith("option-2");
  });

  it("locks choices and exposes correct and incorrect answer text after feedback", () => {
    renderQuestion({
      selectedOptionId: "option-2",
      disabled: true,
      feedback: {
        questionId: "question-textMultipleChoice",
        isCorrect: false,
        correctAnswer: { optionId: "option-1", text: "apple" },
        explanation: null,
      },
    });
    expect(screen.getByRole("radio", { name: "apple. Correct answer" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "orange. Incorrect answer" })).toBeDisabled();
  });

  it("renders backend option ImageUrls while preserving option ID and order", async () => {
    const user = userEvent.setup();
    const onSelectOption = vi.fn();
    renderQuestion({ question: question("imageMultipleChoice"), onSelectOption });
    const radios = screen.getAllByRole("radio");
    expect(radios.map((radio) => radio.getAttribute("aria-label"))).toEqual(["A red apple", "An orange"]);
    expect(screen.getByAltText("A red apple")).toHaveAttribute("src", "/apple.webp");
    expect(screen.getByRole("img", { name: "An orange. Image unavailable." })).toBeInTheDocument();
    await user.click(radios[0]);
    expect(onSelectOption).toHaveBeenCalledWith("option-1");
  });

  it("renders promptImageUrl and makes no third-party image request", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    renderQuestion({
      question: {
        ...question("textMultipleChoice"),
        promptImageUrl: "/reviewed/prompts/apple.webp",
      },
    });
    expect(screen.getByAltText("Question illustration")).toHaveAttribute(
      "src",
      "/reviewed/prompts/apple.webp",
    );
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("ignores prompt audio URLs when no safe speech transcript exists", () => {
    const audioQuestion = question("audioMultipleChoice");
    const { rerender } = renderQuestion({ question: audioQuestion });
    expect(screen.queryByRole("button", { name: /question audio/i })).not.toBeInTheDocument();
    expect(screen.getByText("Audio unavailable. You can continue without it.")).toBeInTheDocument();
    rerender(
      <QuestionStepRenderer
        question={{ ...audioQuestion, promptAudioUrl: null }}
        selectedOptionId={null}
        textAnswer=""
        disabled={false}
        feedback={null}
        onSelectOption={vi.fn()}
        onTextAnswerChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: /question audio/i })).not.toBeInTheDocument();
    expect(screen.getByText("Audio unavailable. You can continue without it.")).toBeInTheDocument();
  });

  it("submits valid text with Enter and preserves the displayed value", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onTextAnswerChange = vi.fn();
    const { rerender } = renderQuestion({
      question: question("textInput"),
      textAnswer: "  BANANA  ",
      onSubmit,
      onTextAnswerChange,
    });
    const input = screen.getByRole("textbox", { name: "Your answer" });
    expect(input).toHaveValue("  BANANA  ");
    await user.type(input, "{Enter}");
    expect(onSubmit).toHaveBeenCalledOnce();

    rerender(
      <QuestionStepRenderer
        question={question("textInput")}
        selectedOptionId={null}
        textAnswer="  BANANA  "
        disabled
        feedback={{ questionId: "q", isCorrect: true, correctAnswer: { optionId: null, text: "banana" }, explanation: null }}
        onSelectOption={vi.fn()}
        onTextAnswerChange={onTextAnswerChange}
        onSubmit={onSubmit}
      />,
    );
    expect(screen.getByRole("textbox", { name: "Your answer" })).toHaveAttribute("readonly");
    expect(screen.getByRole("textbox", { name: "Your answer" })).toHaveValue("  BANANA  ");
  });

  it("does not submit empty text", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderQuestion({ question: question("textInput"), textAnswer: "   ", onSubmit });
    await user.type(screen.getByRole("textbox", { name: "Your answer" }), "{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("fails safely when a choice question has no options", () => {
    renderQuestion({ question: { ...question("textMultipleChoice"), options: [] } });
    expect(screen.getByText(/does not contain any answer options/i)).toBeInTheDocument();
  });
});
