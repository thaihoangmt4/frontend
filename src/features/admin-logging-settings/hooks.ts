"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { systemSettingsService } from "./service";
import type { UpdateSystemSettingsRequest } from "./types";
import { env } from "@/config/env";

export const systemSettingsKey = ["admin", "system", "settings"] as const;

export function useSystemSettings() {
  return useQuery({
    queryKey: systemSettingsKey,
    queryFn: ({ signal }) => systemSettingsService.get(signal),
    retry: (failureCount, error) => {
      if (env.IS_DEVELOPMENT) return false;
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 401 || error.response?.status === 403)
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useUpdateSystemSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateSystemSettingsRequest) =>
      systemSettingsService.update(request),
    onSuccess: (settings) => {
      queryClient.setQueryData(systemSettingsKey, settings);
    },
  });
}
