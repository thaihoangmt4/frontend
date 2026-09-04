import { axiosClient } from "@/lib/axios";
import type { GenerateLessonResponse } from "./types";

const UNITS_URL = "/api/admin/units";

export const adminLessonGenerationService = {
  async generateLesson(unitId: string): Promise<GenerateLessonResponse> {
    const { data } = await axiosClient.post<GenerateLessonResponse>(
      `${UNITS_URL}/${encodeURIComponent(unitId)}/lessons/generate`,
    );
    return data;
  },
};
