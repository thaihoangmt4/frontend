import type { DifficultyLevel } from "@/features/learning-catalog/types";

export type AdminUnitSummary = {
  id: string;
  code: string;
  title: string;
};

export type AdminUnitLesson = {
  id: string;
  code: string;
  title: string;
  topic: string | null;
  order: number;
  difficultyLevel: DifficultyLevel;
};

export type AdminUnitLessonsResponse = {
  unit: AdminUnitSummary;
  items: AdminUnitLesson[];
};

export type GenerateLessonResponse = {
  lessonId: string;
  title: string;
  order: number;
};

export type GenerationError = {
  error?: string;
  detail?: string;
};
