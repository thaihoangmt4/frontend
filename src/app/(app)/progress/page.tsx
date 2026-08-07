import type { Metadata } from "next";
import { LearningProgressPage } from "@/features/learning-progress";
export const metadata: Metadata = { title: "Learning Progress — AI English Learning Platform" };
export default function ProgressPage() { return <LearningProgressPage />; }
