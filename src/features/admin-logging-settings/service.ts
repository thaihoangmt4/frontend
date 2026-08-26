import { axiosClient } from "@/lib/axios";
import type { SystemSettings, UpdateSystemSettingsRequest } from "./types";

const SETTINGS_URL = "/api/system/settings";

export const systemSettingsService = {
  async get(signal?: AbortSignal): Promise<SystemSettings> {
    const { data } = await axiosClient.get<SystemSettings>(SETTINGS_URL, {
      signal,
    });
    return data;
  },

  async update(request: UpdateSystemSettingsRequest): Promise<SystemSettings> {
    const { data } = await axiosClient.put<SystemSettings>(
      SETTINGS_URL,
      request,
    );
    return data;
  },
};
