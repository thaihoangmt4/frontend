import { axiosClient } from "@/lib/axios";
import type {
  ExerciseAnswer,
  LessonSessionResponse,
  SubmitAnswerResponse,
} from "./types";

const API = "/api/learning";

export const lessonSessionService = {
  async getNextLesson(signal?: AbortSignal): Promise<LessonSessionResponse> {
    const { data } = await axiosClient.get<LessonSessionResponse>(
      `${API}/next-lesson`,
      { signal },
    );
    return data;
  },

  async submitAnswer(
    exerciseId: string,
    exerciseVersion: number,
    answer: ExerciseAnswer,
  ): Promise<SubmitAnswerResponse> {
    const { data } = await axiosClient.post<SubmitAnswerResponse>(
      `${API}/exercises/${encodeURIComponent(exerciseId)}/answer`,
      { exerciseVersion, answer },
    );
    return { ...data, isCorrect: data.status === "Correct" };
  },

  async completeLesson(lessonId: string): Promise<void> {
    await axiosClient.post(
      `${API}/lessons/${encodeURIComponent(lessonId)}/complete`,
    );
  },
};
