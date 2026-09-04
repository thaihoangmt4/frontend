export type LessonGenerationSettings = {
  enabled: boolean;
};

export type UpdateLessonGenerationSettingsRequest = {
  enabled: boolean;
};

export type BackendValidationError = {
  error?: string;
  detail?: string;
  errors?: Record<string, string[]>;
};
