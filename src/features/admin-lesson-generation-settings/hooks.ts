"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { lessonGenerationSettingsService } from "./service";
import type { UpdateLessonGenerationSettingsRequest } from "./types";
import { env } from "@/config/env";

export const lessonGenerationSettingsKey = [
  "admin",
  "settings",
  "lesson-generation",
] as const;

export function useLessonGenerationSettings() {
  return useQuery({
    queryKey: lessonGenerationSettingsKey,
    queryFn: ({ signal }) => lessonGenerationSettingsService.get(signal),
    retry: (failureCount, error) => {
      if (env.IS_DEVELOPMENT) return false;
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 401 || error.response?.status === 403)
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useUpdateLessonGenerationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateLessonGenerationSettingsRequest) =>
      lessonGenerationSettingsService.update(request),
    onSuccess: (settings) => {
      queryClient.setQueryData(lessonGenerationSettingsKey, settings);
    },
  });
}
