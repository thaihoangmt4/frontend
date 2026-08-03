"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { useUpdateMyProfile } from "../hooks";
import { DAILY_GOAL_OPTIONS } from "../types";
import type { UpdateUserProfileRequest, UserProfile } from "../types";
import { updateProfileSchema } from "../validation";
import { ProfileCompletion } from "./profile-completion";

type Props = {
  profile: UserProfile;
};

type BackendError = {
  error?: string;
  detail?: string;
  errors?: Record<string, string[]>;
};

const inputClassName =
  "mt-1.5 h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500 aria-invalid:border-red-500 aria-invalid:ring-3 aria-invalid:ring-red-500/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:disabled:bg-neutral-800";

export function ProfileForm({ profile }: Props) {
  const initializedProfileId = useRef<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const mutation = useUpdateMyProfile();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<UpdateUserProfileRequest>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: getFormValues(profile),
  });

  useEffect(() => {
    if (initializedProfileId.current === profile.id) return;
    initializedProfileId.current = profile.id;
    reset(getFormValues(profile));
  }, [profile, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      const updatedProfile = await mutation.mutateAsync(values);
      reset(getFormValues(updatedProfile));
    } catch (error: unknown) {
      if (applyFieldErrors(error, setError)) return;

      setFormError(
        "We couldn't save your profile. Your changes are still here, so please try again.",
      );
      toast.error("Profile not saved", "Please check your connection and try again.");
    }
  });

  return (
    <div className="space-y-5">
      <ProfileCompletion isComplete={profile.isProfileCompleted} />

      <form
        onSubmit={onSubmit}
        className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6"
        noValidate
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email" hint="Managed by your Google account.">
            <input
              id="email"
              type="email"
              value={profile.email}
              readOnly
              aria-readonly="true"
              className={cn(inputClassName, "bg-neutral-50 dark:bg-neutral-800")}
            />
          </Field>

          <Field label="Display name" error={errors.displayName?.message}>
            <input
              id="displayName"
              autoComplete="name"
              aria-invalid={Boolean(errors.displayName)}
              aria-describedby={errors.displayName ? "displayName-error" : undefined}
              className={inputClassName}
              {...register("displayName")}
            />
          </Field>

          <Field
            label="Username"
            hint="We’ll save this in lowercase."
            error={errors.username?.message}
          >
            <input
              id="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={Boolean(errors.username)}
              aria-describedby={errors.username ? "username-error" : undefined}
              className={inputClassName}
              {...register("username")}
            />
          </Field>

          <Field label="Native language" error={errors.nativeLanguageCode?.message}>
            <select
              id="nativeLanguageCode"
              aria-invalid={Boolean(errors.nativeLanguageCode)}
              aria-describedby={
                errors.nativeLanguageCode ? "nativeLanguageCode-error" : undefined
              }
              className={inputClassName}
              {...register("nativeLanguageCode")}
            >
              <option value="vi">Tiếng Việt</option>
            </select>
          </Field>

          <Field
            label="Timezone"
            hint="For example: Asia/Ho_Chi_Minh"
            error={errors.timeZoneId?.message}
          >
            <input
              id="timeZoneId"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={Boolean(errors.timeZoneId)}
              aria-describedby={errors.timeZoneId ? "timeZoneId-error" : undefined}
              className={inputClassName}
              {...register("timeZoneId")}
            />
          </Field>

          <Field label="Daily learning goal" error={errors.dailyGoalMinutes?.message}>
            <select
              id="dailyGoalMinutes"
              aria-invalid={Boolean(errors.dailyGoalMinutes)}
              aria-describedby={
                errors.dailyGoalMinutes ? "dailyGoalMinutes-error" : undefined
              }
              className={inputClassName}
              {...register("dailyGoalMinutes", { valueAsNumber: true })}
            >
              {DAILY_GOAL_OPTIONS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} minutes
                </option>
              ))}
            </select>
          </Field>
        </div>

        {formError && (
          <div
            className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
            role="alert"
          >
            {formError}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button type="submit" size="lg" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  const fieldId = getFieldId(children);

  return (
    <div>
      <label
        htmlFor={fieldId}
        className="text-sm font-medium text-neutral-800 dark:text-neutral-200"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${fieldId}-error`} className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>
      ) : null}
    </div>
  );
}

function getFieldId(children: React.ReactNode): string {
  if (typeof children === "object" && children && "props" in children) {
    const props = children.props as { id?: string };
    return props.id ?? "profile-field";
  }
  return "profile-field";
}

function getFormValues(profile: UserProfile): UpdateUserProfileRequest {
  const detectedTimeZone =
    typeof Intl === "undefined"
      ? ""
      : Intl.DateTimeFormat().resolvedOptions().timeZone;

  return {
    displayName: profile.displayName,
    username: profile.username ?? "",
    nativeLanguageCode: "vi",
    timeZoneId: profile.timeZoneId ?? detectedTimeZone,
    dailyGoalMinutes: isDailyGoal(profile.dailyGoalMinutes)
      ? profile.dailyGoalMinutes
      : 15,
  };
}

function isDailyGoal(value: number): value is UpdateUserProfileRequest["dailyGoalMinutes"] {
  return DAILY_GOAL_OPTIONS.some((option) => option === value);
}

function applyFieldErrors(
  error: unknown,
  setError: ReturnType<typeof useForm<UpdateUserProfileRequest>>["setError"],
): boolean {
  if (!axios.isAxiosError<BackendError>(error)) return false;

  const data = error.response?.data;
  const isUsernameConflict =
    error.response?.status === 409 ||
    data?.error === "user_profile.username_already_exists";

  if (isUsernameConflict) {
    setError("username", {
      type: "server",
      message: "This username is already in use.",
    });
    return true;
  }

  if (data?.errors) {
    const fieldMap: Record<string, keyof UpdateUserProfileRequest> = {
      displayName: "displayName",
      username: "username",
      nativeLanguageCode: "nativeLanguageCode",
      timeZoneId: "timeZoneId",
      dailyGoalMinutes: "dailyGoalMinutes",
    };

    let mapped = false;
    for (const [backendField, messages] of Object.entries(data.errors)) {
      const field = fieldMap[backendField.charAt(0).toLowerCase() + backendField.slice(1)];
      if (field && messages[0]) {
        setError(field, { type: "server", message: messages[0] });
        mapped = true;
      }
    }
    if (mapped) return true;
  }

  return false;
}
