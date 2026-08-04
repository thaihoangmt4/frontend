"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { isNotFoundError } from "./errors";
import { learningService } from "./learning.service";
import type { EvaluateQuestionRequest } from "./learning.types";

const LEARNING_FLOW_STALE_TIME = 30 * 60 * 1000;
const GUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const lessonLearningFlowKeys = {
  all: ["lesson-learning-flow"] as const,
  detail: (lessonId: string) =>
    ["lesson-learning-flow", lessonId] as const,
};

export function isValidLessonId(lessonId: string): boolean {
  return GUID_PATTERN.test(lessonId.trim());
}

export function useLessonLearningFlowQuery(lessonId: string) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const normalizedLessonId = lessonId.trim();

  return useQuery({
    queryKey: lessonLearningFlowKeys.detail(normalizedLessonId),
    queryFn: ({ signal }) =>
      learningService.getLessonLearningFlow(normalizedLessonId, signal),
    enabled:
      !isLoading && isAuthenticated && isValidLessonId(normalizedLessonId),
    staleTime: LEARNING_FLOW_STALE_TIME,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => !isNotFoundError(error) && failureCount < 1,
  });
}

export type EvaluateQuestionVariables = {
  lessonId: string;
  questionId: string;
  request: EvaluateQuestionRequest;
};

export function useEvaluateQuestionMutation() {
  return useMutation({
    mutationFn: ({ lessonId, questionId, request }: EvaluateQuestionVariables) =>
      learningService.evaluateQuestion(lessonId, questionId, request),
  });
}
