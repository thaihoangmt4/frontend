import type { Metadata } from "next";
import { HomeLearningCard } from "@/features/exercise-player";
export const metadata: Metadata = {
  title: "Home — AI English Learning Platform",
};
export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Home</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          Keep building your English skills, one activity at a time.
        </p>
      </div>
      <HomeLearningCard />
    </div>
  );
}
