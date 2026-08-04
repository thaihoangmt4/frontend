import type { Metadata } from "next";
import { LessonPlayerPage } from "@/features/learning-catalog";

export const metadata: Metadata = {
  title: "Learn — AI English Learning Platform",
};

type Props = {
  params: Promise<{ lessonId: string }>;
};

export default async function LearnLessonRoute({ params }: Props) {
  const { lessonId } = await params;
  return <LessonPlayerPage lessonId={lessonId} />;
}
