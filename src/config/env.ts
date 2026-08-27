/**
 * Centralised environment configuration.
 *
 * All environment variables are read here and exposed as a typed object.
 * No other module should read `process.env` directly — import from this
 * file instead.
 */

export const env = {
  /** True only for local Next.js development builds. */
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",

  /** Base URL for the backend API (no trailing slash). */
  API_BASE_URL:
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",

  /** Google OAuth web application client ID. */
  GOOGLE_CLIENT_ID:
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
} as const;
