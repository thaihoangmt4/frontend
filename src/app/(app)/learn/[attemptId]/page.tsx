import type { Metadata } from "next";
import { ExercisePlayerPage } from "@/features/exercise-player";
export const metadata: Metadata = {
  title: "Learn — AI English Learning Platform",
};
export default async function LearnPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  return <ExercisePlayerPage attemptId={attemptId} />;
}
