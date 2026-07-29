"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { getUserFromToken, type JwtUser } from "@/utils/jwt";

export function useUser() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const user = useMemo<JwtUser | null>(() => {
    if (!accessToken) return null;
    return getUserFromToken(accessToken);
  }, [accessToken]);

  return {
    user,
    isAuthenticated,
    /** Display name: prefers JWT name, falls back to email prefix. */
    displayName: user?.name || user?.email?.split("@")[0] || null,
    email: user?.email || null,
    /** First letter for avatar fallback. */
    initial: (user?.name || user?.email || "U")[0].toUpperCase(),
  } as const;
}
