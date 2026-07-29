import { axiosClient } from "@/lib/axios";
import type {
  AuthResponse,
  GoogleLoginRequest,
  LogoutRequest,
  RefreshTokenRequest,
} from "@/types/auth";

const AUTH_URL = "/api/Auth";

export const authService = {
  /**
   * Authenticates via Google ID token.
   * POST /api/Auth/google
   */
  async googleLogin(idToken: string): Promise<AuthResponse> {
    const { data } = await axiosClient.post<AuthResponse>(
      `${AUTH_URL}/google`,
      { idToken } satisfies GoogleLoginRequest,
    );
    return data;
  },

  /**
   * Exchanges a refresh token for new tokens.
   * POST /api/Auth/refresh
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const { data } = await axiosClient.post<AuthResponse>(
      `${AUTH_URL}/refresh`,
      { refreshToken } satisfies RefreshTokenRequest,
    );
    return data;
  },

  /**
   * Revokes the refresh token server-side.
   * POST /api/Auth/logout
   */
  async logout(refreshToken: string): Promise<void> {
    await axiosClient.post(`${AUTH_URL}/logout`, {
      refreshToken,
    } satisfies LogoutRequest);
  },
};
