// ── Auth DTOs (matching backend contracts) ──

export type GoogleLoginRequest = {
  idToken: string;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type LogoutRequest = {
  refreshToken: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO 8601 DateTime from backend
};

// ── Auth state (client-side) ──

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO 8601
};

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};
