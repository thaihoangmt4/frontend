"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminLessonGenerationService } from "./service";

export function useGenerateLesson(unitId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => adminLessonGenerationService.generateLesson(unitId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "unit-lessons", unitId] });
    },
  });
}
