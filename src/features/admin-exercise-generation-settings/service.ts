import { axiosClient } from "@/lib/axios";
import type {
  ExerciseGenerationSettings,
  UpdateExerciseGenerationSettingsRequest,
} from "./types";

const SETTINGS_URL = "/api/admin/settings/exercise-generation";

export const exerciseGenerationSettingsService = {
  async get(signal?: AbortSignal): Promise<ExerciseGenerationSettings> {
    const { data } = await axiosClient.get<ExerciseGenerationSettings>(
      SETTINGS_URL,
      { signal },
    );
    return data;
  },

  async update(
    request: UpdateExerciseGenerationSettingsRequest,
  ): Promise<ExerciseGenerationSettings> {
    const { data } = await axiosClient.put<ExerciseGenerationSettings>(
      SETTINGS_URL,
      request,
    );
    return data;
  },
};
