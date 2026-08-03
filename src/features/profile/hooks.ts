"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/hooks/useToast";
import { profileService } from "./profile.service";
import type { UpdateUserProfileRequest, UserProfile } from "./types";

export const profileQueryKey = ["user-profile", "me"] as const;

export function useMyProfile() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  return useQuery({
    queryKey: profileQueryKey,
    queryFn: ({ signal }) => profileService.getMyProfile(signal),
    enabled: !isLoading && isAuthenticated,
  });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (request: UpdateUserProfileRequest) =>
      profileService.updateMyProfile(request),
    onSuccess: (profile: UserProfile) => {
      queryClient.setQueryData(profileQueryKey, profile);
      toast.success(
        "Profile saved",
        "Your learning preferences are up to date.",
      );
    },
  });
}
