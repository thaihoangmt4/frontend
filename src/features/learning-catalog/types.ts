export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type DifficultyLevel =
  | "Beginner"
  | "Elementary"
  | "Intermediate"
  | "UpperIntermediate"
  | "Advanced"
  | "Proficient";

// Kept as an alias so Sprint 4 consumers do not need to change imports.
export type LessonDifficulty = DifficultyLevel;

export type KnownLessonSectionType =
  | "Introduction"
  | "Vocabulary"
  | "Grammar"
  | "Listening"
  | "Speaking"
  | "Practice"
  | "Review"
  | "Summary";

export type CourseListItem = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  cefrLevel: CefrLevel;
  lessonCount: number;
};

export type GetCoursesResponse = {
  items: CourseListItem[];
};

export type CourseLesson = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  learningObjectiveSummary: string | null;
  estimatedDurationMinutes: number;
  difficultyLevel: LessonDifficulty;
};

export type CourseUnit = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  lessons: CourseLesson[];
};

export type CourseDetail = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  cefrLevel: CefrLevel;
  units: CourseUnit[];
};

export type LessonCourseSummary = {
  id: string;
  code: string;
  title: string;
  cefrLevel: CefrLevel;
};

export type LessonUnitSummary = {
  id: string;
  code: string;
  title: string;
};

export type LessonSection = {
  id: string;
  sectionType: string;
  title: string;
  isRequired: boolean;
};

export type LessonDetail = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  learningObjectiveSummary: string | null;
  estimatedDurationMinutes: number;
  difficultyLevel: LessonDifficulty;
  course: LessonCourseSummary;
  unit: LessonUnitSummary;
  sections: LessonSection[];
};
