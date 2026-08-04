import type { DifficultyLevel } from "./types";

export type LearningStepType = "instruction" | "question";

export type QuestionType =
  | "textMultipleChoice"
  | "imageMultipleChoice"
  | "audioMultipleChoice"
  | "textInput";

export type LessonLearningFlowResponse = {
  lesson: LessonLearningFlow;
  steps: LearningStep[];
};

export type LessonLearningFlow = {
  id: string;
  title: string;
  description: string | null;
  difficultyLevel: DifficultyLevel;
  estimatedDurationMinutes: number;
  totalSteps: number;
};

export type LearningStep = {
  id: string;
  type: LearningStepType;
  displayOrder: number;
  isRequired: boolean;
  instruction: InstructionStep | null;
  question: QuestionStep | null;
};

export type InstructionStep = {
  title: string | null;
  text: string | null;
  vocabulary: VocabularyContent | null;
};

export type VocabularyContent = {
  id: string;
  word: string;
  meaning: string;
  phonetic: string | null;
  partOfSpeech: string;
  exampleSentence: string | null;
  exampleTranslation: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
};

export type QuestionStep = {
  id: string;
  type: QuestionType;
  prompt: string;
  promptImageUrl: string | null;
  promptAudioUrl: string | null;
  options: QuestionOption[];
};

export type QuestionOption = {
  id: string;
  text: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  accessibilityText: string | null;
  displayOrder: number;
};

export type EvaluateQuestionRequest = {
  selectedOptionId: string | null;
  textAnswer: string | null;
};

export type EvaluateQuestionResponse = {
  questionId: string;
  isCorrect: boolean;
  correctAnswer: CorrectAnswer;
  explanation: string | null;
};

export type CorrectAnswer = {
  optionId: string | null;
  text: string | null;
};

const QUESTION_TYPES: ReadonlySet<string> = new Set<QuestionType>([
  "textMultipleChoice",
  "imageMultipleChoice",
  "audioMultipleChoice",
  "textInput",
]);

/** Narrows untrusted backend values and makes newly-added question types detectable. */
export function isQuestionType(value: string): value is QuestionType {
  return QUESTION_TYPES.has(value);
}
