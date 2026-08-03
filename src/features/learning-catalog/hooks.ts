"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { isNotFoundError } from "./errors";
import { learningCatalogService } from "./learning-catalog.service";

export const courseKeys = {
  all: ["courses"] as const,
  list: ["courses", "list"] as const,
  detail: (courseId: string) => ["courses", "detail", courseId] as const,
};

export const lessonKeys = {
  all: ["lessons"] as const,
  detail: (lessonId: string) => ["lessons", "detail", lessonId] as const,
};

export function useCoursesQuery() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  return useQuery({
    queryKey: courseKeys.list,
    queryFn: ({ signal }) => learningCatalogService.getCourses(signal),
    enabled: !isLoading && isAuthenticated,
  });
}

export function useCourseDetailQuery(courseId: string) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  return useQuery({
    queryKey: courseKeys.detail(courseId),
    queryFn: ({ signal }) =>
      learningCatalogService.getCourseById(courseId, signal),
    enabled: !isLoading && isAuthenticated && courseId.length > 0,
    retry: (failureCount, error) => !isNotFoundError(error) && failureCount < 1,
  });
}

export function useLessonDetailQuery(lessonId: string) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  return useQuery({
    queryKey: lessonKeys.detail(lessonId),
    queryFn: ({ signal }) =>
      learningCatalogService.getLessonById(lessonId, signal),
    enabled: !isLoading && isAuthenticated && lessonId.length > 0,
    retry: (failureCount, error) => !isNotFoundError(error) && failureCount < 1,
  });
}
