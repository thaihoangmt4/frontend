import { axiosClient } from "@/lib/axios";
import type {
  ExerciseAnswer,
  LessonAttemptPlayerResponse,
  StartLearningSessionResponse,
  SubmitActivityAnswerResponse,
} from "./types";

const API = "/api/v1";
export const exercisePlayerService = {
  async startOrContinue(): Promise<StartLearningSessionResponse> {
    const { data } = await axiosClient.post<StartLearningSessionResponse>(
      `${API}/learning-sessions`,
    );
    return data;
  },
  async getAttempt(
    id: string,
    signal?: AbortSignal,
  ): Promise<LessonAttemptPlayerResponse> {
    const { data } = await axiosClient.get<LessonAttemptPlayerResponse>(
      `${API}/lesson-attempts/${encodeURIComponent(id)}`,
      { signal },
    );
    return data;
  },
  async submit(
    attemptId: string,
    activityId: string,
    exerciseVersion: number,
    submissionId: string,
    answer: ExerciseAnswer,
  ): Promise<SubmitActivityAnswerResponse> {
    const { data } = await axiosClient.post<SubmitActivityAnswerResponse>(
      `${API}/lesson-attempts/${encodeURIComponent(attemptId)}/activities/${encodeURIComponent(activityId)}/submissions`,
      { submissionId, exerciseVersion, answer },
    );
    return data;
  },
};
