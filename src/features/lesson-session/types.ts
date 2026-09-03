export type ExerciseType =
  | "MultipleChoice"
  | "ImageMatching"
  | "AudioMatching"
  | "Typing"
  | "SentenceOrdering"
  | "Categorization"
  | "DragDrop"
  | "Speaking";

/** Kept for aggregate lesson history/result views owned by learning-progress. */
export type EvaluationStatus =
  | "Correct"
  | "Incorrect"
  | "PartiallyCorrect"
  | "NotEvaluated";

export type ExerciseOption = { id: string; text: string };
export type MatchSource = { id: string; imageMediaId: string; altText: string };
export type MatchTarget = { id: string; text: string };
export type SentenceToken = { id: string; text: string };
export type CategoryItem = { id: string; text: string };
export type Category = { id: string; name: string };

export type ExerciseContent = {
  question?: string;
  options?: ExerciseOption[];
  pronunciationText?: string;
  sources?: MatchSource[];
  targets?: MatchTarget[];
  prompt?: string;
  maxLength?: number | null;
  tokens?: SentenceToken[];
  items?: CategoryItem[];
  categories?: Category[];
  referenceText?: string;
  referenceAudioMediaId?: string | null;
};

export type LessonExercise = {
  exerciseId: string;
  exerciseType: ExerciseType;
  title: string;
  instruction: string;
  displayOrder: number;
  content: ExerciseContent;
};

export type LessonSessionLesson = {
  id: string;
  title: string;
  description: string | null;
  learningObjectiveSummary: string | null;
};

export type LessonSessionResponse = {
  lesson: LessonSessionLesson;
  exercises: LessonExercise[];
};

export type ExerciseAnswer =
  | { selectedOptionId: string }
  | { text: string }
  | { orderedTokenIds: string[] }
  | { matches: { sourceId: string; targetId: string }[] }
  | { assignments: { itemId: string; categoryId: string }[] }
  | { acknowledged: boolean };

export type CorrectAnswer = { text: string | null };

export type SubmitAnswerResponse = {
  exerciseId: string;
  isCorrect: boolean;
  feedback: string | null;
  explanation: string | null;
  correctAnswer: CorrectAnswer | null;
};
