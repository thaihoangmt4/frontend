import { axiosClient } from "@/lib/axios";
import type { ContinueLearningResponse, LearningHistoryResponse, LearningProgressResponse, LearningSessionResponse, LessonAttemptResultResponse } from "./types";

const API = "/api/me";
export const learningProgressService = {
  async continue(signal?: AbortSignal) { return (await axiosClient.get<ContinueLearningResponse>(`${API}/learning/continue`, { signal })).data; },
  async session() { return (await axiosClient.post<LearningSessionResponse>(`${API}/learning/session`)).data; },
  async progress(signal?: AbortSignal) { return (await axiosClient.get<LearningProgressResponse>(`${API}/learning/progress`, { signal })).data; },
  async history(pageNumber: number, pageSize: number, signal?: AbortSignal) { return (await axiosClient.get<LearningHistoryResponse>(`${API}/learning/history`, { params: { pageNumber, pageSize }, signal })).data; },
  async result(attemptId: string, signal?: AbortSignal) { return (await axiosClient.get<LessonAttemptResultResponse>(`${API}/lesson-attempts/${encodeURIComponent(attemptId)}/result`, { signal })).data; },
};
