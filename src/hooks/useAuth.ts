"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";
import { profileQueryKey } from "@/features/profile/hooks";
import { profileService } from "@/features/profile/profile.service";
import { useToast } from "@/hooks/useToast";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const {
    accessToken,
    refreshToken,
    expiresAt,
    isAuthenticated,
    isLoading,
    login,
    logout,
  } = useAuthStore();

  /**
   * Sends the Google credential to the backend, stores tokens,
   * checks profile completion, and redirects to the appropriate authenticated route.
   */
  const loginWithGoogle = useCallback(
    async (credential: string, redirectTo = "/") => {
      const response = await authService.googleLogin(credential);
      login(response);

      try {
        const profile = await profileService.getMyProfile();
        queryClient.setQueryData(profileQueryKey, profile);
        router.replace(profile.isProfileCompleted ? redirectTo : "/profile");
      } catch {
        toast.error(
          "Signed in, but your profile couldn’t be checked",
          "Continue to the app and open Profile from the menu to try again.",
        );
        router.replace(redirectTo);
      }
    },
    [login, queryClient, router, toast],
  );

  /**
   * Revokes the refresh token server-side (best-effort),
   * clears local state, and redirects to /login.
   */
  const handleLogout = useCallback(async () => {
    const token = useAuthStore.getState().refreshToken;

    if (token) {
      authService.logout(token).catch(() => {
        // Best-effort — clear local state regardless
      });
    }

    logout();
    queryClient.removeQueries({ queryKey: profileQueryKey });
    router.replace("/login");
  }, [logout, queryClient, router]);

  return {
    accessToken,
    refreshToken,
    expiresAt,
    isAuthenticated,
    isLoading,
    loginWithGoogle,
    logout: handleLogout,
  } as const;
}
