export type ExerciseGenerationSettings = {
  enabled: boolean;
  initialDelayMinutes: number;
  intervalHours: number;
  minimumExerciseThreshold: number;
  targetExerciseCount: number;
  maxExercisesPerLessonPerRun: number;
  updatedAtUtc: string;
  updatedByUserId: string | null;
  version: string;
};

export type ExerciseGenerationSettingsValues = Pick<
  ExerciseGenerationSettings,
  | "enabled"
  | "initialDelayMinutes"
  | "intervalHours"
  | "minimumExerciseThreshold"
  | "targetExerciseCount"
  | "maxExercisesPerLessonPerRun"
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
