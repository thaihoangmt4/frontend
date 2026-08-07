import { axiosClient } from "@/lib/axios";
import type {
  ExerciseAnswer,
  LessonAttemptPlayerResponse,
  SubmitActivityAnswerResponse,
} from "./types";

const API = "/api/v1";
export const exercisePlayerService = {
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
