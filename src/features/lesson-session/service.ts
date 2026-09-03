import { axiosClient } from "@/lib/axios";
import type {
  ExerciseAnswer,
  LessonSessionResponse,
  SubmitAnswerResponse,
} from "./types";

const API = "/api/learning";

export const lessonSessionService = {
  async getLesson(
    lessonId: string,
    signal?: AbortSignal,
  ): Promise<LessonSessionResponse> {
    const { data } = await axiosClient.get<LessonSessionResponse>(
      `${API}/lessons/${encodeURIComponent(lessonId)}`,
      { signal },
    );
    return data;
  },

  async submitAnswer(
    lessonId: string,
    exerciseId: string,
    answer: ExerciseAnswer,
  ): Promise<SubmitAnswerResponse> {
    const { data } = await axiosClient.post<SubmitAnswerResponse>(
      `${API}/lessons/${encodeURIComponent(lessonId)}/exercises/${encodeURIComponent(exerciseId)}/answer`,
      { answer },
    );
    return data;
  },

  async completeLesson(lessonId: string): Promise<void> {
    await axiosClient.post(
      `${API}/lessons/${encodeURIComponent(lessonId)}/complete`,
    );
  },
};
