"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getPixabayApiKey } from "./pixabay";
import { resolveStepImageSearchQueries } from "./image-search";
import { learningImageQueryOptions } from "./use-learning-image";
import type { LearningStep } from "./learning.types";

export function useLearningImagePreload(currentStep: LearningStep | undefined, nextStep: LearningStep | undefined) {
  const queryClient = useQueryClient();
  const queries = [...new Set([
    ...resolveStepImageSearchQueries(currentStep),
    ...resolveStepImageSearchQueries(nextStep),
  ])];
  const signature = queries.join("\u0000");

  useEffect(() => {
    if (!getPixabayApiKey()) return;
    for (const query of signature.split("\u0000").filter(Boolean)) {
      void queryClient.prefetchQuery(learningImageQueryOptions(query));
    }
  }, [queryClient, signature]);
}
