import type { Metadata } from "next";
import { CoursesPage } from "@/features/learning-catalog";

export const metadata: Metadata = {
  title: "Courses — AI English Learning Platform",
};

export default function CoursesRoute() {
  return <CoursesPage />;
}
