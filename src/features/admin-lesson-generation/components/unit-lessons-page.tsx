"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UnitLessonsPage({ unitId }: { unitId: string }) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Unit</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Unit {unitId}
          </h1>
        </div>
        <Button
          render={<Link href={`/admin/units/${unitId}/lessons/new`} />}
          nativeButton={false}
          className="min-h-11"
        >
          <Plus /> Add Lesson
        </Button>
      </header>

      <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
        The current Backend does not expose an admin lesson-list endpoint. Use
        Add Lesson to request a new AI lesson.
      </p>
    </div>
  );
}

