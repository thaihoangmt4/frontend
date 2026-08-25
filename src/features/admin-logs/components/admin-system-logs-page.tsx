"use client";

import { useMemo, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Switch } from "@base-ui/react/switch";
import axios from "axios";
import { Copy, FileWarning, RefreshCw, Search, ShieldX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAdminLogs, useDebouncedValue } from "../hooks";
import type { AdminLogEntry, AdminLogFilters, AdminLogLevel } from "../types";

const LEVELS: Array<{ label: string; value: AdminLogLevel | "" }> = [
  { label: "All levels", value: "" },
  { label: "Debug", value: "Debug" },
  { label: "Information", value: "Information" },
  { label: "Warning", value: "Warning" },
  { label: "Error", value: "Error" },
  { label: "Fatal", value: "Fatal" },
];

const TIME_RANGES = [
  { label: "Last 15 minutes", value: "15m", milliseconds: 15 * 60_000 },
  { label: "Last hour", value: "1h", milliseconds: 60 * 60_000 },
  { label: "Last 6 hours", value: "6h", milliseconds: 6 * 60 * 60_000 },
  { label: "Last 24 hours", value: "24h", milliseconds: 24 * 60 * 60_000 },
] as const;

type TimeRangeValue = (typeof TIME_RANGES)[number]["value"];

export function AdminSystemLogsPage() {
  const [level, setLevel] = useState<AdminLogLevel | "">("");
  const [search, setSearch] = useState("");
  const [timeRange, setTimeRange] = useState<TimeRangeValue>("1h");
  const [rangeAnchor, setRangeAnchor] = useState(() => Date.now());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AdminLogEntry | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  const filters = useMemo<AdminLogFilters>(() => {
    const range = TIME_RANGES.find((item) => item.value === timeRange)!;
    return {
      level: level || undefined,
      search: debouncedSearch || undefined,
      fromUtc: new Date(rangeAnchor - range.milliseconds).toISOString(),
    };
  }, [debouncedSearch, level, rangeAnchor, timeRange]);

  const query = useAdminLogs(filters, autoRefresh);
  const logs = query.data?.pages.flatMap((page) => page.items) ?? [];
  const forbidden =
    query.isError &&
    axios.isAxiosError(query.error) &&
    query.error.response?.status === 403;

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Administration</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            System logs
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inspect recent backend application events and request diagnostics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {query.isFetching && !query.isPending && (
            <span className="text-xs text-muted-foreground" role="status">
              Refreshing…
            </span>
          )}
          <Button
            variant="outline"
            onClick={() => query.refetch()}
            disabled={query.isPending}
          >
            <RefreshCw className={cn(query.isFetching && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </header>

      <section
        aria-label="Log filters"
        className="rounded-xl border bg-card p-3 shadow-sm"
      >
        <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_180px_190px_auto] md:items-end">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Search
            </span>
            <span className="relative block">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                maxLength={200}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Message, source, or path"
                className="h-9 w-full rounded-lg border bg-background pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </span>
          </label>

          <FilterSelect
            label="Level"
            value={level}
            onChange={(value) => setLevel(value as AdminLogLevel | "")}
            options={LEVELS}
          />

          <FilterSelect
            label="Time range"
            value={timeRange}
            onChange={(value) => {
              setTimeRange(value as TimeRangeValue);
              setRangeAnchor(Date.now());
            }}
            options={TIME_RANGES.map(({ label, value }) => ({ label, value }))}
          />

          <label className="flex h-9 items-center justify-between gap-3 rounded-lg border px-3 md:justify-start">
            <span className="text-sm font-medium">Auto refresh</span>
            <Switch.Root
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
              aria-label="Auto refresh logs"
              className="relative h-5 w-9 rounded-full bg-muted outline-none transition-colors data-[checked]:bg-primary focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Switch.Thumb className="block size-4 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[checked]:translate-x-[18px]" />
            </Switch.Root>
          </label>
        </div>
      </section>

      {query.isPending ? (
        <LogsSkeleton />
      ) : forbidden ? (
        <StateCard>
          <EmptyState
            icon={ShieldX}
            headingLevel={2}
            title="Access denied"
            description="Your account is not authorized to read operational logs."
          />
        </StateCard>
      ) : query.isError ? (
        <StateCard>
          <EmptyState
            icon={FileWarning}
            headingLevel={2}
            title="We couldn’t load system logs"
            description="Check the connection and try again."
            action={{
              label: query.isFetching ? "Trying again…" : "Try again",
              onClick: () => query.refetch(),
            }}
          />
        </StateCard>
      ) : logs.length === 0 ? (
        <StateCard>
          <EmptyState
            icon={FileWarning}
            headingLevel={2}
            title="No logs matched the selected filters"
            description="Try a broader time range or fewer filters."
          />
        </StateCard>
      ) : (
        <LogsTable logs={logs} onSelect={setSelectedLog} />
      )}

      {query.hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            disabled={query.isFetchingNextPage}
            onClick={() => query.fetchNextPage()}
          >
            {query.isFetchingNextPage ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}

      <LogDetailsDialog
        log={selectedLog}
        onOpenChange={(open) => {
          if (!open) setSelectedLog(null);
        }}
      />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function LogsTable({
  logs,
  onSelect,
}: {
  logs: AdminLogEntry[];
  onSelect: (log: AdminLogEntry) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
          <thead className="border-b bg-muted/50 text-xs font-medium text-muted-foreground">
            <tr>
              <TableHeading>Timestamp</TableHeading>
              <TableHeading>Level</TableHeading>
              <TableHeading>Message</TableHeading>
              <TableHeading>Source</TableHeading>
              <TableHeading>Method</TableHeading>
              <TableHeading>Request path</TableHeading>
              <TableHeading>Status</TableHeading>
              <TableHeading>Duration</TableHeading>
              <TableHeading>Trace ID</TableHeading>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map((log, index) => (
              <tr
                key={`${log.timestampUtc}-${log.traceId ?? log.requestId ?? index}`}
                tabIndex={0}
                role="button"
                aria-label={`View ${log.level} log details`}
                onClick={() => onSelect(log)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(log);
                  }
                }}
                className="cursor-pointer align-top hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
              >
                <TableCell className="whitespace-nowrap text-xs">
                  {formatTimestamp(log.timestampUtc)}
                </TableCell>
                <TableCell>
                  <LevelBadge level={log.level} />
                </TableCell>
                <TableCell className="max-w-sm">
                  <p className="line-clamp-2 leading-5">{log.message}</p>
                </TableCell>
                <TableCell className="max-w-48 truncate text-xs text-muted-foreground">
                  {log.sourceContext ?? "—"}
                </TableCell>
                <TableCell>
                  {log.requestMethod ? (
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold">
                      {log.requestMethod}
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="max-w-64 truncate font-mono text-xs">
                  {log.requestPath ?? "—"}
                </TableCell>
                <TableCell>
                  <StatusCode value={log.statusCode} />
                </TableCell>
                <TableCell className="whitespace-nowrap font-mono text-xs">
                  {formatDuration(log.elapsedMs)}
                </TableCell>
                <TableCell className="max-w-44 truncate font-mono text-xs text-muted-foreground">
                  {log.traceId ?? "—"}
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableHeading({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2.5 font-medium">{children}</th>;
}

function TableCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("px-3 py-3", className)}>{children}</td>;
}

function LevelBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    Debug: "bg-muted text-muted-foreground",
    Information: "bg-primary/10 text-primary",
    Warning:
      "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    Error: "bg-destructive/10 text-destructive",
    Fatal: "bg-destructive text-white dark:text-neutral-950",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold",
        styles[level] ?? styles.Debug,
      )}
    >
      {level}
    </span>
  );
}

function StatusCode({ value }: { value: number | null }) {
  if (value === null) return <>—</>;

  return (
    <span
      className={cn(
        "font-mono text-xs font-semibold",
        value >= 500
          ? "text-destructive"
          : value >= 400
            ? "text-amber-700 dark:text-amber-400"
            : value >= 200 && value < 400
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-foreground",
      )}
    >
      {value}
    </span>
  );
}

function LogDetailsDialog({
  log,
  onOpenChange,
}: {
  log: AdminLogEntry | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog.Root open={Boolean(log)} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px]" />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Popup className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border bg-card shadow-2xl outline-none">
            {log && (
              <>
                <div className="flex items-start justify-between gap-4 border-b p-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <Dialog.Title className="text-lg font-semibold">
                        Log details
                      </Dialog.Title>
                      <LevelBadge level={log.level} />
                    </div>
                    <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                      {formatTimestamp(log.timestampUtc)}
                    </Dialog.Description>
                  </div>
                  <Dialog.Close
                    aria-label="Close log details"
                    className="rounded-lg p-2 text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <X className="size-4" />
                  </Dialog.Close>
                </div>

                <div className="max-h-[calc(90vh-82px)] space-y-5 overflow-y-auto p-5">
                  <DetailText label="Message" value={log.message} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DetailValue
                      label="Source context"
                      value={log.sourceContext}
                    />
                    <DetailValue
                      label="Request ID"
                      value={log.requestId}
                      mono
                    />
                    <DetailValue
                      label="Request method"
                      value={log.requestMethod}
                      mono
                    />
                    <DetailValue
                      label="Request path"
                      value={log.requestPath}
                      mono
                    />
                    <DetailValue
                      label="Status code"
                      value={log.statusCode?.toString() ?? null}
                      mono
                    />
                    <DetailValue
                      label="Duration"
                      value={formatDuration(log.elapsedMs)}
                      mono
                    />
                  </div>
                  <TraceDetail value={log.traceId} />
                  {log.exception && (
                    <DetailText label="Exception" value={log.exception} mono />
                  )}
                </div>
              </>
            )}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DetailValue({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={cn("mt-1 break-all text-sm", mono && "font-mono")}>
        {value || "—"}
      </p>
    </div>
  );
}

function DetailText({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <pre
        className={cn(
          "mt-1 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted/60 p-3 text-sm leading-6",
          mono ? "font-mono" : "font-sans",
        )}
      >
        {value}
      </pre>
    </div>
  );
}

function TraceDetail({ value }: { value: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">Trace ID</p>
      <div className="mt-1 flex items-center gap-2 rounded-lg bg-muted/60 p-3">
        <code className="min-w-0 flex-1 break-all text-xs">{value || "—"}</code>
        {value && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Copy trace ID"
            onClick={() => navigator.clipboard.writeText(value)}
          >
            <Copy />
          </Button>
        )}
      </div>
    </div>
  );
}

function LogsSkeleton() {
  return (
    <div
      className="space-y-2 rounded-xl border bg-card p-3 shadow-sm"
      role="status"
      aria-label="Loading system logs"
    >
      <Skeleton className="h-9 w-full" />
      {[1, 2, 3, 4, 5, 6].map((row) => (
        <Skeleton key={row} className="h-12 w-full" />
      ))}
      <span className="sr-only">Loading system logs…</span>
    </div>
  );
}

function StateCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border bg-card shadow-sm">{children}</div>;
}

function formatTimestamp(value: string): string {
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) return value;
  return timestamp.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(value: number | null): string {
  if (value === null) return "—";
  if (value < 1_000) return `${Math.round(value)} ms`;
  return `${(value / 1_000).toFixed(2)} s`;
}
