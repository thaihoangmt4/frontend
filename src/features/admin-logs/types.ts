export type AdminLogLevel =
  "Debug" | "Information" | "Warning" | "Error" | "Fatal";

export type AdminLogEntry = {
  timestampUtc: string;
  level: string;
  message: string;
  sourceContext: string | null;
  traceId: string | null;
  requestId: string | null;
  requestMethod: string | null;
  requestPath: string | null;
  statusCode: number | null;
  elapsedMs: number | null;
  exception: string | null;
};

export type AdminLogPageResponse = {
  items: AdminLogEntry[];
  hasMore: boolean;
  nextBeforeUtc: string | null;
};

export type AdminLogFilters = {
  level?: AdminLogLevel;
  search?: string;
  fromUtc?: string;
  toUtc?: string;
};
