import { z } from "zod";

const integer = (label: string, minimum: number, maximum: number) =>
  z
    .number({ invalid_type_error: `${label} must be a number.` })
    .int(`${label} must be a whole number.`)
    .min(minimum, `${label} must be at least ${minimum}.`)
    .max(maximum, `${label} must be at most ${maximum}.`);

export const exerciseGenerationSettingsSchema = z
  .object({
    enabled: z.boolean(),
    initialDelayMinutes: integer("Initial delay", 0, 1_440),
    intervalHours: integer("Interval", 1, 168),
    minimumExerciseThreshold: integer("Minimum exercise threshold", 0, 500),
    targetExerciseCount: integer("Target exercise count", 0, 500),
    maxExercisesPerLessonPerRun: integer(
      "Maximum exercises per lesson per run",
      1,
      200,
    ),
  })
  .refine(
    (values) => values.targetExerciseCount >= values.minimumExerciseThreshold,
    {
      path: ["targetExerciseCount"],
      message:
        "Target exercise count must be greater than or equal to the minimum threshold.",
    },
  );

export type ExerciseGenerationSettingsFormValues = z.infer<
  typeof exerciseGenerationSettingsSchema
>;
