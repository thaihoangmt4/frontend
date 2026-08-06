export type ExerciseType =
  | "MultipleChoice"
  | "ImageMatching"
  | "AudioMatching"
  | "Typing"
  | "SentenceOrdering"
  | "Categorization"
  | "Speaking";
export type EvaluationStatus =
  "Correct" | "Incorrect" | "PartiallyCorrect" | "NotEvaluated";
export type ActivityStatus = "Pending" | "Completed";

export type ExerciseOption = { id: string; text: string };
export type MatchSource = { id: string; imageMediaId: string; altText: string };
export type MatchTarget = { id: string; text: string };
export type SentenceToken = { id: string; text: string };
export type CategoryItem = { id: string; text: string };
export type Category = { id: string; name: string };

export type ActivityContent = {
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

export type LatestActivityResult = {
  status: EvaluationStatus;
  score: number | null;
  feedback: string | null;
  attemptNumber: number;
  submittedAt: string;
};
export type LearningActivity = {
  activityId: string;
  exerciseId: string;
  activityType: "Lesson" | "Review";
  exerciseType: ExerciseType;
  title: string;
  instruction: string;
  difficulty: string;
  displayOrder: number;
  exerciseVersion: number;
  isRequired: boolean;
  status: ActivityStatus | string;
  latestResult: LatestActivityResult | null;
  content: ActivityContent;
};
export type LessonAttemptPlayerResponse = {
  attempt: {
    id: string;
    lessonId: string;
    status: "InProgress" | "Completed";
    startedAt: string;
    completedAt: string | null;
    currentActivityId: string | null;
    completedActivityCount: number;
    totalActivityCount: number;
    totalScore: number;
    correctCount: number;
    incorrectCount: number;
  };
  lesson: { id: string; title: string; description: string | null };
  activities: LearningActivity[];
};
export type StartLearningSessionResponse = {
  status: "Started" | "Resumed" | "PathCompleted" | "NoPublishedContent";
  lessonAttemptId: string | null;
  lessonId: string | null;
};
export type ExerciseAnswer =
  | { selectedOptionId: string }
  | { text: string }
  | { orderedTokenIds: string[] }
  | { matches: { sourceId: string; targetId: string }[] }
  | { assignments: { itemId: string; categoryId: string }[] }
  | { acknowledged: boolean };
export type SubmitActivityAnswerResponse = {
  submissionId: string;
  lessonAttemptId: string;
  activityId: string;
  exerciseId: string;
  exerciseVersion: number;
  attemptNumber: number;
  evaluation: {
    status: EvaluationStatus;
    score: number | null;
    feedback: string | null;
    explanation: string | null;
    correctAnswer: unknown;
    details: unknown;
  };
  progress: {
    completedActivityCount: number;
    totalActivityCount: number;
    isLessonCompleted: boolean;
    nextActivityId: string | null;
  };
  submittedAt: string;
  isIdempotentReplay: boolean;
};
