"use client";

import { QuestionStepRenderer } from "./question-step-renderer";
import { UnsupportedContent, VocabularyInstruction } from "./vocabulary-instruction";
import type { EvaluateQuestionResponse, LearningStep } from "../learning.types";

export function LearningStepRenderer({
  step,
  selectedOptionId,
  textAnswer,
  disabled,
  feedback,
  onSelectOption,
  onTextAnswerChange,
  onSubmit,
  errorMessageId,
}: {
  step: LearningStep;
  selectedOptionId: string | null;
  textAnswer: string;
  disabled: boolean;
  feedback: EvaluateQuestionResponse | null;
  onSelectOption: (optionId: string) => void;
  onTextAnswerChange: (answer: string) => void;
  onSubmit: () => void;
  errorMessageId?: string;
}) {
  switch (step.type) {
    case "instruction":
      return step.instruction ? (
        <VocabularyInstruction instruction={step.instruction} />
      ) : (
        <UnsupportedContent message="The instruction data is missing." />
      );
    case "question":
      return step.question ? (
        <QuestionStepRenderer
          question={step.question}
          selectedOptionId={selectedOptionId}
          textAnswer={textAnswer}
          disabled={disabled}
          feedback={feedback}
          onSelectOption={onSelectOption}
          onTextAnswerChange={onTextAnswerChange}
          onSubmit={onSubmit}
          errorMessageId={errorMessageId}
        />
      ) : (
        <UnsupportedContent message="The question data is missing." />
      );
    default:
      return <UnsupportedContent message="This learning step type is not supported." />;
  }
}
