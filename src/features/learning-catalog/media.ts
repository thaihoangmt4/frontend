import { env } from "@/config/env";

export function resolveLearningMediaUrl(url: string | null): string | null {
  if (!url) return null;

  try {
    const resolved = new URL(url, `${env.API_BASE_URL}/`);
    return resolved.protocol === "http:" || resolved.protocol === "https:"
      ? resolved.toString()
      : null;
  } catch {
    return null;
  }
}
