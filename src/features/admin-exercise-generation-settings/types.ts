export type ExerciseGenerationSettings = {
  initialDelayMinutes: number;
  intervalHours: number;
  minimumExerciseThreshold: number;
  targetExerciseCount: number;
  maxExercisesPerLessonPerRun: number;
  generationBatchSize: number;
  updatedAtUtc: string;
  updatedByUserId: string | null;
  version: string;
};

export type ExerciseGenerationSettingsValues = Pick<
  ExerciseGenerationSettings,
  | "initialDelayMinutes"
  | "intervalHours"
  | "minimumExerciseThreshold"
  | "targetExerciseCount"
  | "maxExercisesPerLessonPerRun"
  | "generationBatchSize"
>;

export type UpdateExerciseGenerationSettingsRequest =
  ExerciseGenerationSettingsValues & {
    version: string;
  };

export type BackendValidationError = {
  error?: string;
  detail?: string;
  errors?: Record<string, string[]>;
};
