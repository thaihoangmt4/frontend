const PIXABAY_API_ENDPOINT = "https://pixabay.com/api/";
const MAX_QUERY_LENGTH = 100;

export type PixabayImageSearchRequest = {
  query: string;
  imageType?: "photo" | "illustration";
  category?: string;
  orientation?: "horizontal" | "vertical";
  perPage?: number;
  safeSearch?: boolean;
};

export type LearningImageResult = {
  provider: "pixabay";
  providerImageId: number;
  previewUrl: string;
  displayUrl: string;
  width: number | null;
  height: number | null;
  tags: string[];
  pageUrl: string | null;
  authorName: string | null;
};

export class PixabayConfigurationError extends Error {
  constructor() {
    super("Learning images are not configured.");
    this.name = "PixabayConfigurationError";
  }
}

export function normalizeImageSearchQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ").slice(0, MAX_QUERY_LENGTH);
}

export function getPixabayApiKey(): string {
  // This public browser key is an accepted temporary Sprint 5 trade-off, not a secret.
  return process.env.NEXT_PUBLIC_PIXABAY_API_KEY?.trim() ?? "";
}

export async function searchPixabayImages(
  request: PixabayImageSearchRequest,
  signal?: AbortSignal,
): Promise<LearningImageResult[]> {
  const query = normalizeImageSearchQuery(request.query);
  if (!query) return [];
  const apiKey = getPixabayApiKey();
  if (!apiKey) throw new PixabayConfigurationError();

  const url = new URL(PIXABAY_API_ENDPOINT);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("q", query);
  url.searchParams.set("safesearch", String(request.safeSearch ?? true));
  url.searchParams.set("per_page", String(Math.min(10, Math.max(3, request.perPage ?? 5))));
  if (request.imageType) url.searchParams.set("image_type", request.imageType);
  if (request.category) url.searchParams.set("category", request.category);
  if (request.orientation) url.searchParams.set("orientation", request.orientation);

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("Learning image provider request failed.");
  const body: unknown = await response.json();
  if (!isRecord(body) || !Array.isArray(body.hits)) {
    throw new Error("Learning image provider returned an invalid response.");
  }
  return body.hits.map(mapPixabayHit).filter((image): image is LearningImageResult => image !== null);
}

function mapPixabayHit(value: unknown): LearningImageResult | null {
  if (!isRecord(value)) return null;
  const id = value.id;
  const previewUrl = value.previewURL;
  const displayUrl = value.webformatURL;
  if (typeof id !== "number" || typeof previewUrl !== "string" || typeof displayUrl !== "string" || !isTrustedPixabayUrl(previewUrl) || !isTrustedPixabayUrl(displayUrl)) return null;
  return {
    provider: "pixabay",
    providerImageId: id,
    previewUrl,
    displayUrl,
    width: typeof value.webformatWidth === "number" ? value.webformatWidth : null,
    height: typeof value.webformatHeight === "number" ? value.webformatHeight : null,
    tags: typeof value.tags === "string" ? value.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
    pageUrl: typeof value.pageURL === "string" && value.pageURL.startsWith("https://pixabay.com/") ? value.pageURL : null,
    authorName: typeof value.user === "string" ? value.user : null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTrustedPixabayUrl(value: string): boolean {
  try {
    const hostname = new URL(value).hostname;
    return hostname === "pixabay.com" || hostname.endsWith(".pixabay.com");
  } catch {
    return false;
  }
}
