"use client";

import { useQuery } from "@tanstack/react-query";
import { getPixabayApiKey, normalizeImageSearchQuery, searchPixabayImages } from "./pixabay";

const IMAGE_CACHE_TIME = 24 * 60 * 60 * 1000;

export const learningImageKeys = {
  detail: (query: string) => ["learning-image", "pixabay", normalizeImageSearchQuery(query).toLowerCase()] as const,
};

export function learningImageQueryOptions(searchQuery: string) {
  const normalized = normalizeImageSearchQuery(searchQuery).toLowerCase();
  return {
    queryKey: learningImageKeys.detail(normalized),
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      searchPixabayImages({ query: normalized, imageType: "photo", perPage: 5, safeSearch: true }, signal),
    staleTime: IMAGE_CACHE_TIME,
    gcTime: IMAGE_CACHE_TIME,
    refetchOnWindowFocus: false,
    retry: 1,
  };
}

export function useLearningImage(searchQuery: string | null) {
  const normalized = normalizeImageSearchQuery(searchQuery ?? "");
  const query = useQuery({
    ...learningImageQueryOptions(normalized),
    enabled: Boolean(normalized && getPixabayApiKey()),
  });
  return {
    ...query,
    image: query.data?.[0] ?? null,
    isUnavailable: !normalized || !getPixabayApiKey() || query.isError || (query.isSuccess && query.data.length === 0),
  };
}
