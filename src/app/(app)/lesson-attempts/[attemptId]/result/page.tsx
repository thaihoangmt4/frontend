import type { Metadata } from "next";
import { LessonResultPage } from "@/features/learning-progress";
export const metadata: Metadata = { title: "Lesson Result — AI English Learning Platform" };
export default async function ResultPage({ params }: { params: Promise<{ attemptId: string }> }) { const { attemptId } = await params; return <LessonResultPage attemptId={attemptId} />; }
