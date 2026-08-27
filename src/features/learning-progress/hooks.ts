"use client";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { learningProgressService } from "./service";
import { env } from "@/config/env";

export const learningProgressKeys = {
  all: ["learning-progress"] as const,
  continue: () => [...learningProgressKeys.all, "continue"] as const,
  progress: () => [...learningProgressKeys.all, "progress"] as const,
  history: (pageNumber: number, pageSize: number) => [...learningProgressKeys.all, "history", pageNumber, pageSize] as const,
  results: () => [...learningProgressKeys.all, "result"] as const,
  result: (attemptId: string) => [...learningProgressKeys.results(), attemptId] as const,
};
export function useContinueLearning() { return useQuery({ queryKey: learningProgressKeys.continue(), queryFn: ({ signal }) => learningProgressService.continue(signal), staleTime: 0 }); }
export function useLearningProgress() { return useQuery({
  queryKey: learningProgressKeys.progress(),
  queryFn: ({ signal }) => learningProgressService.progress(signal),
  retry: (failureCount, error) => {
    if (env.IS_DEVELOPMENT) return false;
    if (axios.isAxiosError(error) && error.response && error.response.status < 500) return false;
    return failureCount < 2;
  },
}); }
export function useLearningHistory(pageNumber: number, pageSize = 10) { return useQuery({ queryKey: learningProgressKeys.history(pageNumber, pageSize), queryFn: ({ signal }) => learningProgressService.history(pageNumber, pageSize, signal), placeholderData: (previous) => previous }); }
export function useLessonAttemptResult(attemptId: string) { return useQuery({ queryKey: learningProgressKeys.result(attemptId), queryFn: ({ signal }) => learningProgressService.result(attemptId, signal), enabled: Boolean(attemptId) }); }
export function useLearningSession() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: () => learningProgressService.session(), onSuccess: async (data) => {
    queryClient.setQueryData(["lesson-attempt", data.session.attempt.id], data.session);
    await queryClient.invalidateQueries({ queryKey: learningProgressKeys.all });
  } });
}
