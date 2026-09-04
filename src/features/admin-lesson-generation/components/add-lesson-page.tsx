"use client";

import axios from "axios";
import { LoaderCircle, Sparkles, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { useLessonGenerationSettings } from "@/features/admin-lesson-generation-settings";
import { useGenerateLesson } from "../hooks";
import type { GenerationError } from "../types";

export function AddLessonPage({ unitId }: { unitId: string }) {
  const router = useRouter();
  const toast = useToast();
  const settings = useLessonGenerationSettings();
  const generate = useGenerateLesson(unitId);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generationDisabled = settings.data?.enabled === false;
  const lessonsHref = `/admin/units/${unitId}/lessons`;

  async function generateLesson() {
    if (generate.isPending) return;
    setErrorMessage(null);

    try {
      const result = await generate.mutateAsync();
      toast.success(`“${result.title}” generated successfully.`);
      router.push(lessonsHref);
    } catch (error: unknown) {
      setErrorMessage(toUserMessage(error));
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-sm font-medium text-primary">
          <Link href={lessonsHref} className="hover:underline">
            Lessons
          </Link>
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Add Lesson
        </h1>
      </header>

      <section className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-medium text-muted-foreground">Unit</h2>
        <p className="mt-1 text-lg font-semibold">Unit {unitId}</p>

        <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground">
          AI will generate the next lesson for this unit. Each lesson contains
          exactly 10 exercises and follows the existing curriculum.
        </p>

        {generationDisabled && (
          <p
            className="mt-5 rounded-lg border bg-muted/35 px-4 py-3 text-sm text-muted-foreground"
            role="status"
          >
            AI Lesson Generation is currently disabled. Enable it in Settings to
            generate new lessons.
          </p>
        )}

        {errorMessage && (
          <p
            role="alert"
            className="mt-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {errorMessage}
          </p>
        )}

        <Button
          type="button"
          className="mt-6 min-h-11 w-full sm:w-auto"
          disabled={generate.isPending || generationDisabled}
          onClick={generateLesson}
        >
          {generate.isPending ? (
            <>
              <LoaderCircle className="animate-spin" aria-hidden="true" />
              Generating lesson…
            </>
          ) : (
            <>
              <Sparkles aria-hidden="true" /> Generate Lesson
            </>
          )}
        </Button>
      </section>
    </div>
  );
}

function toUserMessage(error: unknown): string {
  if (axios.isAxiosError<GenerationError>(error)) {
    const status = error.response?.status;
    if (status === 409)
      return "AI Lesson Generation is currently disabled. Enable it in Settings and try again.";
    if (status === 404) return "This unit no longer exists.";
    if (status === 429)
      return "Too many generation requests right now. Please try again in a moment.";
  }
  return "Unable to generate a valid lesson. Please try again.";
}
