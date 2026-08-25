"use client";

import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { adminLogsService } from "./service";
import type { AdminLogFilters } from "./types";

export const adminLogKeys = {
  all: ["admin-logs"] as const,
  list: (filters: AdminLogFilters) =>
    [...adminLogKeys.all, "list", filters] as const,
};

export function useAdminLogs(filters: AdminLogFilters, autoRefresh: boolean) {
  return useInfiniteQuery({
    queryKey: adminLogKeys.list(filters),
    queryFn: ({ pageParam, signal }) =>
      adminLogsService.getLogs(filters, pageParam, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextBeforeUtc
        ? lastPage.nextBeforeUtc
        : undefined,
    refetchInterval: autoRefresh ? 7_500 : false,
    refetchIntervalInBackground: false,
    retry: (failureCount, error) => {
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

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(timeout);
  }, [delayMs, value]);

  return debouncedValue;
}
