"use client";

import { useEffect, useState } from "react";
import { Select } from "@base-ui/react/select";
import axios from "axios";
import {
  Check,
  ChevronDown,
  FileText,
  RotateCcw,
  ShieldX,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/useToast";
import { useSystemSettings, useUpdateSystemSettings } from "../hooks";
import { LOG_LEVELS, type LogLevel, type SystemSettings } from "../types";

const LEVEL_DESCRIPTIONS: Record<LogLevel, string> = {
  Debug:
    "Detailed diagnostic information. Useful temporarily when investigating production issues.",
  Information: "Normal application activity. Recommended production default.",
  Warning: "Potential problems that do not stop the application.",
  Error: "Failures that affect an operation.",
  Fatal: "Critical failures that may stop the application.",
};

const LOG_LEVEL_OPTIONS = LOG_LEVELS.map((level) => ({
  label: level,
  value: level,
}));

export function SystemSettingsSection() {
  const query = useSystemSettings();
  const forbidden =
    query.isError &&
    axios.isAxiosError(query.error) &&
    query.error.response?.status === 403;

  if (query.isPending) return <SystemSettingsSkeleton />;

  if (forbidden) {
    return (
      <LoggingPageState
        icon={ShieldX}
        title="Access denied"
        description="Your account is not authorized to manage system settings."
      />
    );
  }

  if (query.isError || !query.data) {
    return (
      <LoggingPageState
        icon={TriangleAlert}
        title="We couldn’t load system settings"
        description="Check the connection and try again."
        action={{
          label: query.isFetching ? "Trying again…" : "Try again",
          onClick: () => query.refetch(),
        }}
      />
    );
  }

  return <SystemSettingsForm settings={query.data} />;
}

function SystemSettingsForm({ settings }: { settings: SystemSettings }) {
  const [selectedLevel, setSelectedLevel] = useState(settings.minimumLogLevel);
  const [saveError, setSaveError] = useState<string | null>(null);
  const mutation = useUpdateSystemSettings();
  const toast = useToast();
  const isDirty = selectedLevel !== settings.minimumLogLevel;

  useEffect(() => {
    setSelectedLevel(settings.minimumLogLevel);
    setSaveError(null);
  }, [settings.minimumLogLevel]);

  const save = async () => {
    setSaveError(null);
    try {
      const updated = await mutation.mutateAsync({
        minimumLogLevel: selectedLevel,
      });
      setSelectedLevel(updated.minimumLogLevel);
      toast.success(`Logging level updated to ${updated.minimumLogLevel}.`);
    } catch {
      setSaveError(
        "We couldn’t update the logging level. Your selection is still here, so please try again.",
      );
      toast.error(
        "Logging level not updated",
        "Please check your connection and try again.",
      );
    }
  };

  const reset = () => {
    setSelectedLevel(settings.minimumLogLevel);
    setSaveError(null);
  };

  return (
    <section className="space-y-5" aria-labelledby="system-heading">
      <header>
        <h2
          id="system-heading"
          className="text-xl font-semibold tracking-tight"
        >
          System
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Configure the minimum severity captured by application logging.
        </p>
      </header>

      <div className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3 border-b pb-4">
          <span className="rounded-lg bg-primary/10 p-2 text-primary">
            <FileText className="size-4" />
          </span>
          <div>
            <h3 className="font-semibold">Application Logging</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Controls the minimum application log level written by the backend.
              Changes take effect immediately and persist across application
              restarts.
            </p>
          </div>
        </div>

        <div className="max-w-xl">
          <label htmlFor="minimum-log-level" className="text-sm font-medium">
            Minimum Log Level
          </label>
          <Select.Root
            items={LOG_LEVEL_OPTIONS}
            value={selectedLevel}
            onValueChange={(value) => {
              if (isLogLevel(value)) {
                setSelectedLevel(value);
                setSaveError(null);
              }
            }}
          >
            <Select.Trigger
              id="minimum-log-level"
              aria-describedby="minimum-log-level-description"
              className="mt-2 flex h-10 w-full items-center justify-between rounded-lg border bg-background px-3 text-sm outline-none transition focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Select.Value />
              <Select.Icon>
                <ChevronDown className="size-4 text-muted-foreground" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner className="z-50" sideOffset={4}>
                <Select.Popup className="min-w-[var(--anchor-width)] overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
                  <Select.List>
                    {LOG_LEVELS.map((level) => (
                      <Select.Item
                        key={level}
                        value={level}
                        className="relative flex cursor-default select-none items-center rounded-md py-2 pr-8 pl-3 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                      >
                        <Select.ItemText>{level}</Select.ItemText>
                        <Select.ItemIndicator className="absolute right-2">
                          <Check className="size-4" />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
          <p
            id="minimum-log-level-description"
            className="mt-2 text-xs text-muted-foreground"
          >
            {LEVEL_DESCRIPTIONS[selectedLevel]}
          </p>
          <p className="mt-3 text-sm font-medium">
            Current level: {settings.minimumLogLevel}
          </p>

          {selectedLevel === "Debug" && (
            <div
              className="mt-4 rounded-lg border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/30 dark:text-amber-200"
              role="status"
            >
              Debug logging generates additional diagnostic data and may
              increase log volume. Use it temporarily while investigating
              production issues.
            </div>
          )}

          {saveError && (
            <p
              className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              {saveError}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <SystemSettingsMetadata settings={settings} />
          <div className="flex gap-2 sm:shrink-0">
            <Button
              type="button"
              variant="outline"
              disabled={!isDirty || mutation.isPending}
              onClick={reset}
            >
              <RotateCcw />
              Reset
            </Button>
            <Button
              type="button"
              disabled={!isDirty || mutation.isPending}
              onClick={save}
            >
              {mutation.isPending ? "Saving…" : "Save logging level"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SystemSettingsMetadata({ settings }: { settings: SystemSettings }) {
  if (!settings.updatedAtUtc && !settings.updatedByUserId) return <span />;

  return (
    <div className="text-xs text-muted-foreground">
      {settings.updatedAtUtc && (
        <p>Last updated: {formatTimestamp(settings.updatedAtUtc)}</p>
      )}
      {settings.updatedByUserId && (
        <p className="mt-1 font-mono">Updated by: {settings.updatedByUserId}</p>
      )}
    </div>
  );
}

function SystemSettingsSkeleton() {
  return (
    <div
      className="space-y-5"
      role="status"
      aria-label="Loading system settings"
    >
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-72 rounded-xl" />
      <span className="sr-only">Loading system settings…</span>
    </div>
  );
}

function LoggingPageState({
  icon,
  title,
  description,
  action,
}: {
  icon: typeof ShieldX;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <EmptyState
        icon={icon}
        headingLevel={2}
        title={title}
        description={description}
        action={action}
      />
    </div>
  );
}

function isLogLevel(value: unknown): value is LogLevel {
  return LOG_LEVELS.includes(value as LogLevel);
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
