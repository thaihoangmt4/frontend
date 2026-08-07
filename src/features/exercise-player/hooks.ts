"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { exercisePlayerService } from "./service";
import type { ExerciseAnswer } from "./types";
import { learningProgressKeys } from "@/features/learning-progress/hooks";

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
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: attemptKeys.detail(attemptId),
      });
      await queryClient.invalidateQueries({ queryKey: learningProgressKeys.all });
    },
  });
}
