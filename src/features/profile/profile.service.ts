import { axiosClient } from "@/lib/axios";
import type { UpdateUserProfileRequest, UserProfile } from "./types";

const PROFILE_URL = "/api/Users/me/profile";

export const profileService = {
  async getMyProfile(signal?: AbortSignal): Promise<UserProfile> {
    const { data } = await axiosClient.get<UserProfile>(PROFILE_URL, { signal });
    return data;
  },

  async updateMyProfile(
    request: UpdateUserProfileRequest,
  ): Promise<UserProfile> {
    const { data } = await axiosClient.put<UserProfile>(PROFILE_URL, request);
    return data;
  },
};
