import type { Metadata } from "next";
import { LessonDetailPage } from "@/features/learning-catalog";

export const metadata: Metadata = {
  title: "Lesson — AI English Learning Platform",
};

type Props = {
  params: Promise<{ lessonId: string }>;
};

export default async function LessonDetailRoute({ params }: Props) {
  const { lessonId } = await params;

  return <LessonDetailPage lessonId={lessonId} />;
}
