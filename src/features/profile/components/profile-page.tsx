"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyProfile } from "../hooks";
import { ProfileForm } from "./profile-form";

export function ProfilePage() {
  const profileQuery = useMyProfile();

  if (profileQuery.isPending) return <ProfilePageSkeleton />;

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900 dark:bg-neutral-900">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
          <h1 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            We couldn’t load your profile
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            Please try again. If this keeps happening, sign out and sign back in or contact support.
          </p>
          <Button
            type="button"
            className="mt-6"
            onClick={() => profileQuery.refetch()}
            disabled={profileQuery.isFetching}
          >
            {profileQuery.isFetching ? "Trying again..." : "Try again"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Your profile
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          Tell us a little about you so we can personalize your learning experience.
        </p>
      </div>

      <ProfileForm profile={profileQuery.data} />
    </div>
  );
}

function ProfilePageSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6" role="status" aria-label="Loading profile">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid gap-5 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
