import type { Metadata } from "next";
import { LessonSessionPage } from "@/features/lesson-session";

export const metadata: Metadata = {
  title: "Lesson — AI English Learning Platform",
};

export default async function LearnLessonRoute({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  return <LessonSessionPage lessonId={lessonId} />;
}
