import type { EvaluationStatus } from "@/features/lesson-session/types";

export type ContinueState = "Resume" | "StartNextLesson" | "CourseCompleted" | "NoActiveAssignment";
export type ContinueLearningResponse = {
  state: ContinueState;
  courseId: string | null;
  lessonAttemptId: string | null;
  nextActivityId: string | null;
  nextLesson: { id: string; title: string; unitTitle: string; estimatedDurationMinutes: number } | null;
};
export type LessonProgress = { id: string; code: string; title: string; displayOrder: number; state: "Completed" | "Current" | "Upcoming"; lessonAttemptId: string | null };
export type UnitProgress = { id: string; code: string; title: string; displayOrder: number; lessons: LessonProgress[] };
export type LearningProgressState = "InProgress" | "CourseCompleted" | "NoActiveAssignment";
export type CourseProgress = { assignmentId: string; courseId: string; courseCode: string; courseTitle: string; assignmentStatus: "Assigned" | "InProgress" | "Completed" };
export type LearningProgressResponse = { state: LearningProgressState; course: CourseProgress | null; completedLessonCount: number; totalLessonCount: number; progressPercentage: number; units: UnitProgress[] };
export type HistoryItem = { lessonAttemptId: string; lessonId: string; lessonTitle: string; status: "InProgress" | "Completed"; startedAt: string; lastAccessedAt: string | null; completedAt: string | null; totalScore: number; completedActivityCount: number; totalActivityCount: number };
export type LearningHistoryResponse = { pageNumber: number; pageSize: number; totalCount: number; items: HistoryItem[] };
export type ActivityResult = { activityId: string; exerciseId: string; exerciseTitle: string; displayOrder: number; completed: boolean; evaluationStatus: EvaluationStatus | null; score: number | null; attemptNumber: number | null; submittedAt: string | null };
export type LessonAttemptResultResponse = { lessonAttemptId: string; lessonId: string; lessonTitle: string; status: "InProgress" | "Completed"; startedAt: string; completedAt: string | null; totalScore: number; correctCount: number; incorrectCount: number; completedActivityCount: number; totalActivityCount: number; activities: ActivityResult[] };
