export function resolveLearningImageSource(imageUrl: string | null): string | null {
  const value = imageUrl?.trim();
  if (!value) return null;

  // Relative URLs are accepted only when explicitly supplied by the backend contract.
  if (value.startsWith("/") && !value.startsWith("//")) return value;

  try {
    const url = new URL(value);
    const assetsHostname =
      process.env.NEXT_PUBLIC_ASSETS_HOSTNAME?.trim() || "assets.example.com";
    return url.protocol === "https:" && url.hostname === assetsHostname
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}
