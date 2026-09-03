import type { LessonSessionState } from "./lesson-session.types";

export const LESSON_SESSION_STORAGE_KEY = "learning:lesson-session";

const PHASES = new Set([
  "intro",
  "learning",
  "review-intro",
  "review",
  "completing",
  "completed",
]);

export function readLessonSessionSnapshot(
  lessonId: string,
): LessonSessionState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(LESSON_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isLessonSessionState(parsed)) return null;
    if (parsed.lessonId !== lessonId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeLessonSessionSnapshot(state: LessonSessionState): void {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(
      LESSON_SESSION_STORAGE_KEY,
      JSON.stringify(state),
    );
  } catch {
    // Storage can be unavailable (private mode, quota). Recovery is best effort.
  }
}

export function clearLessonSessionSnapshot(): void {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(LESSON_SESSION_STORAGE_KEY);
  } catch {
    // Ignored for the same reason as writes.
  }
}

function isLessonSessionState(value: unknown): value is LessonSessionState {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.lessonId === "string" &&
    typeof candidate.phase === "string" &&
    PHASES.has(candidate.phase) &&
    typeof candidate.currentIndex === "number" &&
    typeof candidate.reviewIndex === "number" &&
    Array.isArray(candidate.reviewQueue) &&
    candidate.reviewQueue.every((id) => typeof id === "string")
  );
}
