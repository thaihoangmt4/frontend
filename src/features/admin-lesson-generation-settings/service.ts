import { axiosClient } from "@/lib/axios";
import type {
  LessonGenerationSettings,
  UpdateLessonGenerationSettingsRequest,
} from "./types";

const SETTINGS_URL = "/api/admin/settings/lesson-generation";

export const lessonGenerationSettingsService = {
  async get(signal?: AbortSignal): Promise<LessonGenerationSettings> {
    const { data } = await axiosClient.get<LessonGenerationSettings>(
      SETTINGS_URL,
      { signal },
    );
    return data;
  },

  async update(
    request: UpdateLessonGenerationSettingsRequest,
  ): Promise<LessonGenerationSettings> {
    const { data } = await axiosClient.put<LessonGenerationSettings>(
      SETTINGS_URL,
      request,
    );
    return data;
  },
};
