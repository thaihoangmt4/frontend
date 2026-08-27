import axios, { type InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";

export const axiosClient = axios.create({
  baseURL: env.API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Browser aborts flow into ASP.NET Core's RequestAborted token. Keep the
  // production deadline, but allow long Visual Studio breakpoint pauses.
  timeout: env.IS_DEVELOPMENT ? 0 : 10000,
});

// ── Request interceptor: attach access token ──

axiosClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();

  if (accessToken && !isAuthEndpoint(config.url)) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// ── Token refresh queue (prevents concurrent refresh calls) ──

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((pending) => {
    if (error || !token) {
      pending.reject(error);
    } else {
      pending.resolve(token);
    }
  });
  failedQueue = [];
}

// ── Response interceptor: handle 401 → refresh → retry ──

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only handle 401, not on auth endpoints, and not already retried
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    const { refreshToken: storedRefreshToken, logout } =
      useAuthStore.getState();

    if (!storedRefreshToken) {
      logout();
      return Promise.reject(error);
    }

    // If a refresh is already in-flight, queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const response = await authService.refreshToken(storedRefreshToken);
      useAuthStore.getState().refreshTokens(response);

      processQueue(null, response.accessToken);

      originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
      return axiosClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      logout();

      // Only redirect if on client side
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// ── Helpers ──

function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  // Don't attach tokens to auth endpoints (they don't need them, and on
  // refresh we'd create a loop).
  return url.includes("/Auth/");
}
