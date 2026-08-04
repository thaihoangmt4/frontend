"use client";

import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import { ChoiceOption, type ChoiceOptionStatus } from "./choice-option";
import { LearningAudio, LearningImage } from "./learning-media";
import { UnsupportedContent } from "./vocabulary-instruction";
import type {
  EvaluateQuestionResponse,
  QuestionOption,
  QuestionStep,
} from "../learning.types";
import { isQuestionType } from "../learning.types";
import { buildVocabularyImageSearchQuery, resolveQuestionPromptImageSearchTerm } from "../image-search";

export type QuestionRendererProps = {
  question: QuestionStep;
  selectedOptionId: string | null;
  textAnswer: string;
  disabled: boolean;
  feedback: EvaluateQuestionResponse | null;
  onSelectOption: (optionId: string) => void;
  onTextAnswerChange: (answer: string) => void;
  onSubmit: () => void;
  errorMessageId?: string;
};

export function QuestionStepRenderer(props: QuestionRendererProps) {
  if (!isQuestionType(props.question.type)) {
    return (
      <UnsupportedContent message="This question type is not supported by this version of the app." />
    );
  }

  if (
    props.question.type !== "textInput" &&
    props.question.options.length === 0
  ) {
    return (
      <UnsupportedContent message="This question does not contain any answer options." />
    );
  }

  switch (props.question.type) {
    case "textMultipleChoice":
      return <TextMultipleChoice {...props} />;
    case "imageMultipleChoice":
      return <ImageMultipleChoice {...props} />;
    case "audioMultipleChoice":
      return <AudioMultipleChoice {...props} />;
    case "textInput":
      return <TextInputQuestion {...props} />;
  }
}

function QuestionHeading({ question }: { question: QuestionStep }) {
  const promptImageQuery = resolveQuestionPromptImageSearchTerm(question);
  return (
    <>
      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
        Practice
      </p>
      <h1 id="lesson-player-heading" className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-100">
        {question.prompt}
      </h1>
      {promptImageQuery && (
        <div className="mt-6">
          <LearningImage searchQuery={promptImageQuery} alt="Question illustration" />
        </div>
      )}
    </>
  );
}

function PromptAudio({ question, prominent = false }: { question: QuestionStep; prominent?: boolean }) {
  if (question.type !== "audioMultipleChoice") return null;
  return (
    <div className="mt-6">
      <LearningAudio
        text=""
        label="question audio"
        prominent={prominent}
      />
    </div>
  );
}

function TextMultipleChoice(props: QuestionRendererProps) {
  return (
    <QuestionShell question={props.question}>
      <PromptAudio question={props.question} />
      <ChoiceList {...props} />
    </QuestionShell>
  );
}

function ImageMultipleChoice(props: QuestionRendererProps) {
  const options = orderedOptions(props.question.options);
  return (
    <QuestionShell question={props.question}>
      <PromptAudio question={props.question} />
      <div role="radiogroup" aria-label={props.question.prompt} aria-describedby={props.errorMessageId} onKeyDown={handleRadioKeyDown} className="mt-7 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
        {options.map((option) => {
          const label = option.accessibilityText || option.text || "Image answer";
          return (
            <ChoiceOption
              key={option.id}
              selected={props.selectedOptionId === option.id}
              disabled={props.disabled}
              status={getOptionStatus(option, props.selectedOptionId, props.feedback)}
              onSelect={() => props.onSelectOption(option.id)}
              label={label}
            >
              <LearningImage
                searchQuery={buildVocabularyImageSearchQuery(option.text || option.accessibilityText || "")}
                alt={label}
                className="aspect-square"
              />
              {option.text && (
                <span className="mt-3 block text-center font-semibold">{option.text}</span>
              )}
            </ChoiceOption>
          );
        })}
      </div>
    </QuestionShell>
  );
}

function AudioMultipleChoice(props: QuestionRendererProps) {
  return (
    <QuestionShell question={props.question}>
      <PromptAudio question={props.question} prominent />
      <ChoiceList {...props} />
    </QuestionShell>
  );
}

function TextInputQuestion({
  question,
  textAnswer,
  disabled,
  onTextAnswerChange,
  onSubmit,
  errorMessageId,
}: QuestionRendererProps) {
  const canSubmit = textAnswer.trim().length > 0 && !disabled;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (canSubmit) onSubmit();
  }

  return (
    <QuestionShell question={question}>
      <PromptAudio question={question} />
      <form className="mt-7" onSubmit={handleSubmit}>
        <label htmlFor={`answer-${question.id}`} className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Your answer
        </label>
        <input
          id={`answer-${question.id}`}
          type="text"
          value={textAnswer}
          onChange={(event) => onTextAnswerChange(event.target.value)}
          readOnly={disabled}
          autoComplete="off"
          enterKeyHint="done"
          aria-describedby={errorMessageId}
          className="mt-2 min-h-14 w-full rounded-xl border-2 border-neutral-200 bg-white px-4 text-base text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 read-only:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:read-only:bg-neutral-800"
          placeholder="Type your answer"
        />
        <button type="submit" className="sr-only" disabled={!canSubmit}>
          Check answer
        </button>
      </form>
    </QuestionShell>
  );
}

function QuestionShell({ question, children }: { question: QuestionStep; children: ReactNode }) {
  return (
    <fieldset className="w-full max-w-2xl border-0 p-0" disabled={false}>
      <legend className="sr-only">{question.prompt}</legend>
      <QuestionHeading question={question} />
      {children}
    </fieldset>
  );
}

function ChoiceList(props: QuestionRendererProps) {
  return (
    <div role="radiogroup" aria-label={props.question.prompt} aria-describedby={props.errorMessageId} onKeyDown={handleRadioKeyDown} className="mt-7 space-y-3">
      {orderedOptions(props.question.options).map((option) => {
        const label = option.text || option.accessibilityText || "Answer option";
        return (
          <ChoiceOption
            key={option.id}
            selected={props.selectedOptionId === option.id}
            disabled={props.disabled}
            status={getOptionStatus(option, props.selectedOptionId, props.feedback)}
            onSelect={() => props.onSelectOption(option.id)}
            label={label}
          >
            <span className="font-semibold">{label}</span>
          </ChoiceOption>
        );
      })}
    </div>
  );
}

function handleRadioKeyDown(event: KeyboardEvent<HTMLDivElement>) {
  const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];
  if (!keys.includes(event.key)) return;

  const options = Array.from(
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)'),
  );
  const currentIndex = options.indexOf(event.target as HTMLButtonElement);
  if (currentIndex < 0 || options.length === 0) return;

  event.preventDefault();
  const nextIndex =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? options.length - 1
        : event.key === "ArrowDown" || event.key === "ArrowRight"
          ? (currentIndex + 1) % options.length
          : (currentIndex - 1 + options.length) % options.length;
  options[nextIndex].focus();
  options[nextIndex].click();
}

function orderedOptions(options: QuestionOption[]): QuestionOption[] {
  return [...options].sort((left, right) => left.displayOrder - right.displayOrder);
}

function getOptionStatus(
  option: QuestionOption,
  selectedOptionId: string | null,
  feedback: EvaluateQuestionResponse | null,
): ChoiceOptionStatus {
  if (!feedback) return "default";
  if (feedback.correctAnswer.optionId === option.id) return "correct";
  if (selectedOptionId === option.id && !feedback.isCorrect) return "incorrect";
  return "default";
}
