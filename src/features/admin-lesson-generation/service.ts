import { axiosClient } from "@/lib/axios";
import type {
  AdminUnitLessonsResponse,
  GenerateLessonResponse,
} from "./types";

const UNITS_URL = "/api/admin/units";

export const adminLessonGenerationService = {
  async getUnitLessons(
    unitId: string,
    signal?: AbortSignal,
  ): Promise<AdminUnitLessonsResponse> {
    const { data } = await axiosClient.get<AdminUnitLessonsResponse>(
      `${UNITS_URL}/${encodeURIComponent(unitId)}/lessons`,
      { signal },
    );
    return data;
  },

  async generateLesson(unitId: string): Promise<GenerateLessonResponse> {
    const { data } = await axiosClient.post<GenerateLessonResponse>(
      `${UNITS_URL}/${encodeURIComponent(unitId)}/lessons/generate`,
    );
    return data;
  },
};
