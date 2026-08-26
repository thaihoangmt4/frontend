export const LOG_LEVELS = [
  "Debug",
  "Information",
  "Warning",
  "Error",
  "Fatal",
] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

export type SystemSettings = {
  minimumLogLevel: LogLevel;
  updatedAtUtc?: string | null;
  updatedByUserId?: string | null;
};

export type UpdateSystemSettingsRequest = Pick<
  SystemSettings,
  "minimumLogLevel"
>;
