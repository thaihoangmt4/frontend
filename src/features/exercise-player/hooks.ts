"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { exercisePlayerService } from "./service";
import type { ExerciseAnswer } from "./types";

export const attemptKeys = {
  detail: (id: string) => ["lesson-attempt", id] as const,
};
export function useAttempt(id: string) {
  return useQuery({
    queryKey: attemptKeys.detail(id),
    queryFn: ({ signal }) => exercisePlayerService.getAttempt(id, signal),
    enabled: Boolean(id),
    staleTime: 0,
  });
}
export function useStartLearning() {
  return useMutation({
    mutationFn: () => exercisePlayerService.startOrContinue(),
  });
}
export function useSubmitActivity(attemptId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: {
      activityId: string;
      exerciseVersion: number;
      submissionId: string;
      answer: ExerciseAnswer;
    }) =>
      exercisePlayerService.submit(
        attemptId,
        v.activityId,
        v.exerciseVersion,
        v.submissionId,
        v.answer,
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: attemptKeys.detail(attemptId),
      }),
  });
}
