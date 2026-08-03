import { z } from "zod";

const usernamePattern = /^[a-z][a-z0-9_-]{2,29}$/;

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters.")
    .max(100, "Display name must be 100 characters or fewer."),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username must be 30 characters or fewer.")
    .regex(
      usernamePattern,
      "Use a letter first, followed by letters, numbers, underscores, or hyphens.",
    ),
  nativeLanguageCode: z.literal("vi"),
  timeZoneId: z
    .string()
    .trim()
    .min(1, "Timezone is required.")
    .max(100, "Timezone must be 100 characters or fewer."),
  dailyGoalMinutes: z.union(
    [
      z.literal(5),
      z.literal(10),
      z.literal(15),
      z.literal(20),
      z.literal(30),
      z.literal(45),
      z.literal(60),
    ],
    { invalid_type_error: "Choose one of the available daily goals." },
  ),
});
