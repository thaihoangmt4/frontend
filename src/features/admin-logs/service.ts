import { axiosClient } from "@/lib/axios";
import type { AdminLogFilters, AdminLogPageResponse } from "./types";

const ADMIN_LOGS_URL = "/api/admin/logs";
const PAGE_SIZE = 100;

export const adminLogsService = {
  async getLogs(
    filters: AdminLogFilters,
    beforeUtc?: string,
    signal?: AbortSignal,
  ): Promise<AdminLogPageResponse> {
    const { data } = await axiosClient.get<AdminLogPageResponse>(
      ADMIN_LOGS_URL,
      {
        params: {
          ...filters,
          limit: PAGE_SIZE,
          beforeUtc,
        },
        signal,
      },
    );

    return data;
  },
};
