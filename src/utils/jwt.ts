/**
 * Decodes a base64url-encoded string to UTF-8.
 */
function base64UrlDecode(str: string): string {
  // Convert base64url to standard base64
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  // Decode binary string to UTF-8
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * Decodes the payload of a JWT without verifying the signature.
 * Returns `null` if the token is malformed.
 */
export function decodeJwt<T = Record<string, unknown>>(
  token: string,
): T | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(base64UrlDecode(parts[1])) as T;
  } catch {
    return null;
  }
}

export type JwtUser = {
  sub: string; // NameIdentifier
  email: string;
  name: string;
  role: string;
  exp: number;
  iss: string;
  aud: string;
};

/**
 * Extracts user info from a JWT access token.
 * Returns `null` if the token is invalid or expired.
 */
export function getUserFromToken(token: string): JwtUser | null {
  const user = decodeJwt<JwtUser>(token);
  if (!user) return null;

  // Check expiry (exp is in seconds since epoch)
  if (user.exp && user.exp * 1000 < Date.now()) return null;

  return user;
}
