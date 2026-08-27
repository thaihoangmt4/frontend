"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  Info,
  RotateCcw,
  Settings2,
  ShieldX,
  TriangleAlert,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/useToast";
import {
  useExerciseGenerationSettings,
  useUpdateExerciseGenerationSettings,
} from "../hooks";
import type {
  BackendValidationError,
  ExerciseGenerationSettings,
  ExerciseGenerationSettingsValues,
} from "../types";
import {
  exerciseGenerationSettingsSchema,
  type ExerciseGenerationSettingsFormValues,
} from "../validation";

const inputClassName =
  "mt-2 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20";

export function ExerciseGenerationSettingsPage() {
  const query = useExerciseGenerationSettings();
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
        description="Your account is not authorized to manage exercise generation settings."
      />
    );
  }

  if (query.isError || !query.data) {
    return (
      <PageState
        icon={TriangleAlert}
        title="We couldn’t load exercise generation settings"
        description="Check the connection and try again."
        action={{
          label: query.isFetching ? "Trying again…" : "Try again",
          onClick: () => query.refetch(),
        }}
      />
    );
  }

  return (
    <section
      className="space-y-5"
      aria-labelledby="exercise-generation-heading"
    >
      <header>
        <h2
          id="exercise-generation-heading"
          className="text-xl font-semibold tracking-tight"
        >
          Exercise Generation
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Controls how the background exercise-generation process schedules work
          and replenishes exercise inventory.
        </p>
      </header>

      <ExerciseGenerationSettingsForm
        settings={query.data}
        reloadLatest={async () => (await query.refetch()).data}
      />
    </section>
  );
}

function ExerciseGenerationSettingsForm({
  settings,
  reloadLatest,
}: {
  settings: ExerciseGenerationSettings;
  reloadLatest: () => Promise<ExerciseGenerationSettings | undefined>;
}) {
  const initializedVersion = useRef<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [hasConflict, setHasConflict] = useState(false);
  const mutation = useUpdateExerciseGenerationSettings();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty, isValid },
  } = useForm<ExerciseGenerationSettingsFormValues>({
    resolver: zodResolver(exerciseGenerationSettingsSchema),
    defaultValues: toFormValues(settings),
    mode: "onChange",
  });

  useEffect(() => {
    if (initializedVersion.current === settings.version) return;
    initializedVersion.current = settings.version;
    reset(toFormValues(settings));
    setFormError(null);
    setHasConflict(false);
  }, [reset, settings]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setHasConflict(false);

    try {
      const updated = await mutation.mutateAsync({
        ...values,
        version: settings.version,
      });
      initializedVersion.current = updated.version;
      reset(toFormValues(updated));
      toast.success("Exercise generation settings updated.");
    } catch (error: unknown) {
      if (isConcurrencyConflict(error)) {
        setHasConflict(true);
        setFormError(
          "These settings were changed by another administrator. Reload the latest values before saving.",
        );
        return;
      }

      if (applyBackendFieldErrors(error, setError)) {
        setFormError("Review the highlighted settings and try again.");
        return;
      }

      setFormError(
        "We couldn’t save these settings. Your changes are still here, so please try again.",
      );
      toast.error(
        "Settings not saved",
        "Please check your connection and try again.",
      );
    }
  });

  const resetChanges = () => {
    reset(toFormValues(settings));
    setFormError(null);
    setHasConflict(false);
  };

  const reloadAfterConflict = async () => {
    const latest = await reloadLatest();
    if (!latest) return;
    initializedVersion.current = latest.version;
    reset(toFormValues(latest));
    setFormError(null);
    setHasConflict(false);
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <SettingsSection
        title="Generation Schedule"
        description="Controls when the background worker begins and repeats its scheduled work."
      >
        <SettingField
          id="initialDelayMinutes"
          label="Initial Delay Minutes"
          description="How long the worker waits after application startup before its first generation run. Changes apply when the worker next starts."
          error={errors.initialDelayMinutes?.message}
        >
          <input
            id="initialDelayMinutes"
            type="number"
            min={0}
            max={1440}
            step={1}
            inputMode="numeric"
            aria-invalid={Boolean(errors.initialDelayMinutes)}
            aria-describedby={fieldDescriptionIds(
              "initialDelayMinutes",
              Boolean(errors.initialDelayMinutes),
            )}
            className={inputClassName}
            {...register("initialDelayMinutes", { valueAsNumber: true })}
          />
        </SettingField>

        <SettingField
          id="intervalHours"
          label="Interval Hours"
          description="How long the worker waits between scheduled generation cycles. Schedule changes apply when the worker next starts."
          error={errors.intervalHours?.message}
        >
          <input
            id="intervalHours"
            type="number"
            min={1}
            max={168}
            step={1}
            inputMode="numeric"
            aria-invalid={Boolean(errors.intervalHours)}
            aria-describedby={fieldDescriptionIds(
              "intervalHours",
              Boolean(errors.intervalHours),
            )}
            className={inputClassName}
            {...register("intervalHours", { valueAsNumber: true })}
          />
        </SettingField>
      </SettingsSection>

      <SettingsSection
        title="Generation Capacity"
        description="Controls which lessons need content and how much work one generation cycle can perform."
      >
        <SettingField
          id="minimumExerciseThreshold"
          label="Minimum Exercise Threshold"
          description="Lessons with fewer exercises than this threshold are eligible for replenishment."
          error={errors.minimumExerciseThreshold?.message}
        >
          <NumericInput
            id="minimumExerciseThreshold"
            min={0}
            max={500}
            invalid={Boolean(errors.minimumExerciseThreshold)}
            register={register("minimumExerciseThreshold", {
              valueAsNumber: true,
            })}
          />
        </SettingField>

        <SettingField
          id="targetExerciseCount"
          label="Target Exercise Count"
          description="The inventory level eligible lessons are replenished toward, subject to the per-run safety limit."
          error={errors.targetExerciseCount?.message}
        >
          <NumericInput
            id="targetExerciseCount"
            min={0}
            max={500}
            invalid={Boolean(errors.targetExerciseCount)}
            register={register("targetExerciseCount", { valueAsNumber: true })}
          />
        </SettingField>

        <SettingField
          id="maxExercisesPerLessonPerRun"
          label="Maximum Exercises Per Lesson Per Run"
          description="Safety limit that caps how many exercises one lesson can request during a generation cycle."
          error={errors.maxExercisesPerLessonPerRun?.message}
        >
          <NumericInput
            id="maxExercisesPerLessonPerRun"
            min={1}
            max={200}
            invalid={Boolean(errors.maxExercisesPerLessonPerRun)}
            register={register("maxExercisesPerLessonPerRun", {
              valueAsNumber: true,
            })}
          />
        </SettingField>
      </SettingsSection>

      <aside className="flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-muted-foreground">
          Generation thresholds and limits take effect on the next generation
          cycle. Initial delay and interval changes apply when the generation
          worker next starts. Saving does not trigger generation immediately.
        </p>
      </aside>

      {formError && (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <p>{formError}</p>
          {hasConflict && (
            <Button
              type="button"
              variant="outline"
              className="mt-3"
              onClick={reloadAfterConflict}
            >
              Reload latest values
            </Button>
          )}
        </div>
      )}

      <div className="flex flex-col-reverse gap-4 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <SettingsMetadata settings={settings} />
        <div className="flex gap-2 sm:shrink-0">
          <Button
            type="button"
            variant="outline"
            disabled={!isDirty || mutation.isPending}
            onClick={resetChanges}
          >
            <RotateCcw />
            Reset changes
          </Button>
          <Button
            type="submit"
            disabled={!isDirty || !isValid || mutation.isPending || hasConflict}
          >
            {mutation.isPending ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function NumericInput({
  id,
  min,
  max,
  invalid,
  register,
}: {
  id: keyof ExerciseGenerationSettingsValues;
  min: number;
  max: number;
  invalid: boolean;
  register: ReturnType<
    ReturnType<typeof useForm<ExerciseGenerationSettingsFormValues>>["register"]
  >;
}) {
  return (
    <input
      id={id}
      type="number"
      min={min}
      max={max}
      step={1}
      inputMode="numeric"
      aria-invalid={invalid}
      aria-describedby={fieldDescriptionIds(id, invalid)}
      className={inputClassName}
      {...register}
    />
  );
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3 border-b pb-4">
        <span className="rounded-lg bg-primary/10 p-2 text-primary">
          <Settings2 className="size-4" />
        </span>
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function SettingField({
  id,
  label,
  description,
  error,
  children,
}: {
  id: string;
  label: string;
  description: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <p
        id={`${id}-description`}
        className="mt-1 text-xs text-muted-foreground"
      >
        {description}
      </p>
      {children}
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-xs text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function SettingsMetadata({
  settings,
}: {
  settings: ExerciseGenerationSettings;
}) {
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
      aria-label="Loading exercise generation settings"
    >
      <Skeleton className="h-9 w-80 max-w-full" />
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-80 rounded-xl" />
      <span className="sr-only">Loading exercise generation settings…</span>
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

function toFormValues(
  settings: ExerciseGenerationSettings,
): ExerciseGenerationSettingsFormValues {
  return {
    initialDelayMinutes: settings.initialDelayMinutes,
    intervalHours: settings.intervalHours,
    minimumExerciseThreshold: settings.minimumExerciseThreshold,
    targetExerciseCount: settings.targetExerciseCount,
    maxExercisesPerLessonPerRun: settings.maxExercisesPerLessonPerRun,
  };
}

function fieldDescriptionIds(id: string, invalid: boolean): string {
  return invalid ? `${id}-description ${id}-error` : `${id}-description`;
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

function applyBackendFieldErrors(
  error: unknown,
  setError: ReturnType<
    typeof useForm<ExerciseGenerationSettingsFormValues>
  >["setError"],
): boolean {
  if (!axios.isAxiosError<BackendValidationError>(error)) return false;
  const errors = error.response?.data?.errors;
  if (!errors) return false;

  const fieldMap: Record<string, keyof ExerciseGenerationSettingsFormValues> = {
    initialdelayminutes: "initialDelayMinutes",
    intervalhours: "intervalHours",
    minimumexercisethreshold: "minimumExerciseThreshold",
    targetexercisecount: "targetExerciseCount",
    maxexercisesperlessonperrun: "maxExercisesPerLessonPerRun",
  };

  let mapped = false;
  for (const [backendField, messages] of Object.entries(errors)) {
    const field = fieldMap[backendField.toLowerCase()];
    if (field && messages[0]) {
      setError(field, { type: "server", message: messages[0] });
      mapped = true;
    }
  }
  return mapped;
}
