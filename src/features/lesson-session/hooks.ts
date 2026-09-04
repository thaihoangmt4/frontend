"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { lessonSessionService } from "./service";
import type { ExerciseAnswer } from "./types";

export const lessonSessionKeys = {
  all: ["lesson-session"] as const,
  next: () => ["lesson-session", "next"] as const,
};

export function useLessonSessionQuery() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  return useQuery({
    queryKey: lessonSessionKeys.next(),
    queryFn: ({ signal }) => lessonSessionService.getNextLesson(signal),
    enabled: !isLoading && isAuthenticated,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}

export type SubmitAnswerVariables = {
  exerciseId: string;
  exerciseVersion: number;
  answer: ExerciseAnswer;
};

export function useSubmitAnswerMutation() {
  return useMutation({
    mutationFn: ({ exerciseId, exerciseVersion, answer }: SubmitAnswerVariables) =>
      lessonSessionService.submitAnswer(exerciseId, exerciseVersion, answer),
  });
}

export function useCompleteLessonMutation(lessonId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => lessonSessionService.completeLesson(lessonId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: lessonSessionKeys.next(),
      });
    },
  });
}
