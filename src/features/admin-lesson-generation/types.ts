export type GenerateLessonResponse = {
  lessonId: string;
  title: string;
  order: number;
};

export type GenerationError = {
  error?: string;
  detail?: string;
};
