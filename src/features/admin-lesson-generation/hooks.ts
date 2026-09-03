"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminLessonGenerationService } from "./service";

export const adminUnitLessonKeys = {
  all: ["admin", "unit-lessons"] as const,
  list: (unitId: string) => ["admin", "unit-lessons", unitId] as const,
};

export function useAdminUnitLessons(unitId: string) {
  return useQuery({
    queryKey: adminUnitLessonKeys.list(unitId),
    queryFn: ({ signal }) =>
      adminLessonGenerationService.getUnitLessons(unitId, signal),
    enabled: unitId.length > 0,
  });
}

export function useGenerateLesson(unitId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => adminLessonGenerationService.generateLesson(unitId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminUnitLessonKeys.list(unitId),
      });
    },
  });
}
