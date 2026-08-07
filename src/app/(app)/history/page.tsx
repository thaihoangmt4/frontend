import type { Metadata } from "next";
import { LearningHistoryPage } from "@/features/learning-progress";
export const metadata: Metadata = { title: "Learning History — AI English Learning Platform" };
export default function HistoryPage() { return <LearningHistoryPage />; }
