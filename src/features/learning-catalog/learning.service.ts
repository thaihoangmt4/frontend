import { axiosClient } from "@/lib/axios";
import type {
  EvaluateQuestionRequest,
  EvaluateQuestionResponse,
  LessonLearningFlowResponse,
} from "./learning.types";

const LESSONS_URL = "/api/lessons";

export const learningService = {
  async getLessonLearningFlow(
    lessonId: string,
    signal?: AbortSignal,
  ): Promise<LessonLearningFlowResponse> {
    const encodedLessonId = encodeURIComponent(lessonId);
    const { data } = await axiosClient.get<LessonLearningFlowResponse>(
      `${LESSONS_URL}/${encodedLessonId}/learning-flow`,
      { signal },
    );
    return data;
  },

  async evaluateQuestion(
    lessonId: string,
    questionId: string,
    request: EvaluateQuestionRequest,
    signal?: AbortSignal,
  ): Promise<EvaluateQuestionResponse> {
    const encodedLessonId = encodeURIComponent(lessonId);
    const encodedQuestionId = encodeURIComponent(questionId);
    const { data } = await axiosClient.post<EvaluateQuestionResponse>(
      `${LESSONS_URL}/${encodedLessonId}/questions/${encodedQuestionId}/evaluate`,
      request,
      { signal },
    );
    return data;
  },
};
