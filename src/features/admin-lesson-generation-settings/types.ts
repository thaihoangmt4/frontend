export type LessonGenerationSettings = {
  enabled: boolean;
  updatedAtUtc: string;
  updatedByUserId: string | null;
  version: string;
};

export type UpdateLessonGenerationSettingsRequest = {
  enabled: boolean;
  version: string;
};

export type BackendValidationError = {
  error?: string;
  detail?: string;
  errors?: Record<string, string[]>;
};
