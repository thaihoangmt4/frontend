"use client";

import { useEffect, useRef, useState } from "react";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Switch } from "@base-ui/react/switch";
import axios from "axios";
import { ShieldX, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/useToast";
import {
  useLessonGenerationSettings,
  useUpdateLessonGenerationSettings,
} from "../hooks";
import type {
  BackendValidationError,
  LessonGenerationSettings,
} from "../types";

export function LessonGenerationSettingsPage() {
  const query = useLessonGenerationSettings();
  const forbidden =
    query.isError &&
    axios.isAxiosError(query.error) &&
    query.error.response?.status === 403;

  if (query.isPending) return <SettingsSkeleton />;

  if (forbidden) {
    return (
      <PageState
        icon={ShieldX}
        title="Access denied"
        description="Your account is not authorized to manage lesson generation settings."
      />
    );
  }

  if (query.isError || !query.data) {
    return (
      <PageState
        icon={TriangleAlert}
        title="We couldn’t load lesson generation settings"
        description="Check the connection and try again."
        action={{
          label: query.isFetching ? "Trying again…" : "Try again",
          onClick: () => query.refetch(),
        }}
      />
    );
  }

  return (
    <section className="space-y-5" aria-labelledby="lesson-generation-heading">
      <header>
        <h2
          id="lesson-generation-heading"
          className="text-xl font-semibold tracking-tight"
        >
          Lesson Generation
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Controls whether administrators can generate new AI lessons for a
          unit.
        </p>
      </header>

      <LessonGenerationSettingsForm
        settings={query.data}
        reloadLatest={async () => (await query.refetch()).data}
      />
    </section>
  );
}

function LessonGenerationSettingsForm({
  settings,
  reloadLatest,
}: {
  settings: LessonGenerationSettings;
  reloadLatest: () => Promise<LessonGenerationSettings | undefined>;
}) {
  const initializedVersion = useRef<string | null>(null);
  const [enabled, setEnabled] = useState(settings.enabled);
  const [formError, setFormError] = useState<string | null>(null);
  const [hasConflict, setHasConflict] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const mutation = useUpdateLessonGenerationSettings();
  const toast = useToast();

  useEffect(() => {
    if (initializedVersion.current === settings.version) return;
    initializedVersion.current = settings.version;
    setEnabled(settings.enabled);
    setFormError(null);
    setHasConflict(false);
  }, [settings]);

  const isDirty = enabled !== settings.enabled;

  async function save() {
    setFormError(null);
    setHasConflict(false);

    try {
      const updated = await mutation.mutateAsync({
        enabled,
        version: settings.version,
      });
      initializedVersion.current = updated.version;
      setEnabled(updated.enabled);
      toast.success("Lesson generation settings updated.");
    } catch (error: unknown) {
      if (isConcurrencyConflict(error)) {
        setHasConflict(true);
        setFormError(
          "These settings were changed by another administrator. Reload the latest values before saving.",
        );
        return;
      }

      setFormError(
        "We couldn’t save these settings. Your change is still here, so please try again.",
      );
      toast.error(
        "Settings not saved",
        "Please check your connection and try again.",
      );
    }
  }

  async function reloadAfterConflict() {
    const latest = await reloadLatest();
    if (!latest) return;
    initializedVersion.current = latest.version;
    setEnabled(latest.enabled);
    setFormError(null);
    setHasConflict(false);
  }

  return (
    <div className="space-y-5">
      <section
        className="rounded-xl border bg-card p-5 shadow-sm sm:p-6"
        aria-labelledby="lesson-generation-enabled-label"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <h3 id="lesson-generation-enabled-label" className="font-semibold">
              AI Lesson Generation
            </h3>
            <p
              id="lesson-generation-enabled-description"
              className="mt-1 text-sm text-muted-foreground"
            >
              When enabled, administrators can generate a new lesson with ten
              exercises for a unit. When disabled, generation requests are
              rejected.
            </p>
          </div>

          <Switch.Root
            checked={enabled}
            disabled={mutation.isPending}
            onCheckedChange={(checked) => {
              if (checked) {
                setEnabled(true);
                return;
              }
              setDisableDialogOpen(true);
            }}
            aria-labelledby="lesson-generation-enabled-label"
            aria-describedby="lesson-generation-enabled-description"
            className="relative h-6 w-11 shrink-0 rounded-full bg-muted outline-none transition-colors data-[checked]:bg-primary focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Switch.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[checked]:translate-x-5" />
          </Switch.Root>
        </div>

        <div
          className="mt-5 rounded-lg border bg-muted/35 px-4 py-3"
          aria-live="polite"
        >
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">
              {enabled ? "Enabled" : "Disabled"}
            </p>
            {isDirty && (
              <span className="rounded-full border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
                Pending save
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {enabled
              ? "Administrators can generate new AI lessons."
              : "AI Lesson Generation is currently disabled. Existing lessons remain available to learners."}
          </p>
        </div>

        <AlertDialog.Root
          open={disableDialogOpen}
          onOpenChange={setDisableDialogOpen}
        >
          <AlertDialog.Portal>
            <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px]" />
            <AlertDialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <AlertDialog.Popup className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl outline-none dark:bg-neutral-900">
                <AlertDialog.Title className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Disable AI Lesson Generation?
                </AlertDialog.Title>
                <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                  Administrators will not be able to generate new lessons.
                  Existing lessons remain available to learners. You can enable
                  generation again at any time.
                </AlertDialog.Description>
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <AlertDialog.Close className="inline-flex h-11 items-center justify-center rounded-lg border border-neutral-200 px-4 text-sm font-medium outline-none hover:bg-neutral-50 focus-visible:ring-3 focus-visible:ring-blue-500/30 dark:border-neutral-700 dark:hover:bg-neutral-800">
                    Cancel
                  </AlertDialog.Close>
                  <AlertDialog.Close
                    onClick={() => setEnabled(false)}
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-medium text-white outline-none hover:bg-red-700 focus-visible:ring-3 focus-visible:ring-red-500/30"
                  >
                    Disable
                  </AlertDialog.Close>
                </div>
              </AlertDialog.Popup>
            </AlertDialog.Viewport>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </section>

      {formError && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {formError}
        </p>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SettingsMetadata settings={settings} />
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          {hasConflict && (
            <Button
              type="button"
              variant="outline"
              onClick={reloadAfterConflict}
            >
              Reload latest
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={!isDirty || mutation.isPending}
            onClick={() => {
              setEnabled(settings.enabled);
              setFormError(null);
              setHasConflict(false);
            }}
          >
            Reset
          </Button>
          <Button
            type="button"
            disabled={!isDirty || mutation.isPending || hasConflict}
            onClick={save}
          >
            {mutation.isPending ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SettingsMetadata({ settings }: { settings: LessonGenerationSettings }) {
  return (
    <div className="text-xs text-muted-foreground">
      <p>Last updated: {formatTimestamp(settings.updatedAtUtc)}</p>
      {settings.updatedByUserId && (
        <p className="mt-1 font-mono">Updated by: {settings.updatedByUserId}</p>
      )}
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div
      className="space-y-5"
      role="status"
      aria-label="Loading lesson generation settings"
    >
      <Skeleton className="h-9 w-80 max-w-full" />
      <Skeleton className="h-48 rounded-xl" />
      <span className="sr-only">Loading lesson generation settings…</span>
    </div>
  );
}

function PageState({
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
    <div className="mx-auto max-w-3xl rounded-xl border bg-card shadow-sm">
      <EmptyState
        icon={icon}
        headingLevel={1}
        title={title}
        description={description}
        action={action}
      />
    </div>
  );
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

function isConcurrencyConflict(error: unknown): boolean {
  if (!axios.isAxiosError<BackendValidationError>(error)) return false;
  return (
    error.response?.status === 409 ||
    error.response?.data?.error ===
      "exercise_generation.settings_concurrency_conflict"
  );
}
