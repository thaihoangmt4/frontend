"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { exerciseGenerationSettingsService } from "./service";
import type { UpdateExerciseGenerationSettingsRequest } from "./types";

export const exerciseGenerationSettingsKey = [
  "admin",
  "settings",
  "exercise-generation",
] as const;

export function useExerciseGenerationSettings() {
  return useQuery({
    queryKey: exerciseGenerationSettingsKey,
    queryFn: ({ signal }) => exerciseGenerationSettingsService.get(signal),
    retry: (failureCount, error) => {
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

export function useUpdateExerciseGenerationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateExerciseGenerationSettingsRequest) =>
      exerciseGenerationSettingsService.update(request),
    onSuccess: (settings) => {
      queryClient.setQueryData(exerciseGenerationSettingsKey, settings);
    },
  });
}
