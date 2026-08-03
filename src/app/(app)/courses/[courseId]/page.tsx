import type { Metadata } from "next";
import { CourseDetailPage } from "@/features/learning-catalog";

export const metadata: Metadata = {
  title: "Course — AI English Learning Platform",
};

type Props = {
  params: Promise<{ courseId: string }>;
};

export default async function CourseDetailRoute({ params }: Props) {
  const { courseId } = await params;

  return <CourseDetailPage courseId={courseId} />;
}
