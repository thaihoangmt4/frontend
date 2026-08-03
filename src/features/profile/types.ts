export const DAILY_GOAL_OPTIONS = [5, 10, 15, 20, 30, 45, 60] as const;

export type DailyGoalMinutes = (typeof DAILY_GOAL_OPTIONS)[number];

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  username: string | null;
  nativeLanguageCode: string | null;
  timeZoneId: string | null;
  dailyGoalMinutes: number;
  isProfileCompleted: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type UpdateUserProfileRequest = {
  displayName: string;
  username: string;
  nativeLanguageCode: "vi";
  timeZoneId: string;
  dailyGoalMinutes: DailyGoalMinutes;
};
