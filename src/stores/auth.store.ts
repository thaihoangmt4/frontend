import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse, AuthState } from "@/types/auth";

type AuthActions = {
  login: (response: AuthResponse) => void;
  refreshTokens: (response: AuthResponse) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
};

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // ── State ──
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
      isLoading: true, // starts true until hydration completes

      // ── Actions ──
      login: (response) =>
        set({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresAt: response.expiresAt,
          isAuthenticated: true,
          isLoading: false,
        }),

      refreshTokens: (response) =>
        set({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresAt: response.expiresAt,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
      // On rehydration, check if token is expired
      onRehydrateStorage: () => (state) => {
        if (state) {
          const isExpired =
            state.expiresAt ? new Date(state.expiresAt).getTime() <= Date.now() : true;

          if (isExpired && state.isAuthenticated) {
            // Token expired — keep refresh token for a retry, but mark unauthenticated
            state.isAuthenticated = false;
            state.accessToken = null;
            state.expiresAt = null;
          }

          state.isLoading = false;
        }
      },
    },
  ),
);
