"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { learningProgressKeys } from "@/features/learning-progress/hooks";
import { lessonSessionService } from "./service";
import type { ExerciseAnswer } from "./types";

export const lessonSessionKeys = {
  all: ["lesson-session"] as const,
  lesson: (lessonId: string) => ["lesson-session", lessonId] as const,
};

export function useLessonSessionQuery(lessonId: string) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  return useQuery({
    queryKey: lessonSessionKeys.lesson(lessonId),
    queryFn: ({ signal }) => lessonSessionService.getLesson(lessonId, signal),
    enabled: !isLoading && isAuthenticated && lessonId.length > 0,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}

export type SubmitAnswerVariables = {
  exerciseId: string;
  answer: ExerciseAnswer;
};

export function useSubmitAnswerMutation(lessonId: string) {
  return useMutation({
    mutationFn: ({ exerciseId, answer }: SubmitAnswerVariables) =>
      lessonSessionService.submitAnswer(lessonId, exerciseId, answer),
  });
}

export function useCompleteLessonMutation(lessonId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => lessonSessionService.completeLesson(lessonId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: learningProgressKeys.all,
      });
    },
  });
}
