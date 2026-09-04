import type { Metadata } from "next";
import { LessonSessionPage } from "@/features/lesson-session";

export const metadata: Metadata = {
  title: "Lesson — AI English Learning Platform",
};

export default function LearnLessonRoute() {
  return <LessonSessionPage />;
}
