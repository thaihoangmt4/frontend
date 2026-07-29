"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";

export function useAuth() {
  const router = useRouter();
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
   * and redirects to `redirectTo` (defaults to "/").
   */
  const loginWithGoogle = useCallback(
    async (credential: string, redirectTo = "/") => {
      const response = await authService.googleLogin(credential);
      login(response);
      router.replace(redirectTo);
    },
    [login, router],
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
    router.replace("/login");
  }, [logout, router]);

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
