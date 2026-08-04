import { afterEach, describe, expect, it, vi } from "vitest";
import { buildVocabularyImageSearchQuery } from "./image-search";
import { PixabayConfigurationError, searchPixabayImages } from "./pixabay";

describe("buildVocabularyImageSearchQuery", () => {
  it("uses deterministic overrides and normalizes whitespace", () => {
    expect(buildVocabularyImageSearchQuery("  APPLE  ")).toBe("red apple fruit isolated");
    expect(buildVocabularyImageSearchQuery("ice   cube")).toBe("ice cube object isolated");
  });

  it("returns null for empty content and limits generic queries", () => {
    expect(buildVocabularyImageSearchQuery("   ")).toBeNull();
    expect(buildVocabularyImageSearchQuery("x".repeat(200))).toHaveLength(100);
  });
});

describe("searchPixabayImages", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("builds a safe request and maps only the internal fields", async () => {
    vi.stubEnv("NEXT_PUBLIC_PIXABAY_API_KEY", "test-key");
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ hits: [{
        id: 42,
        previewURL: "https://cdn.pixabay.com/preview.jpg",
        webformatURL: "https://pixabay.com/get/apple_640.jpg",
        webformatWidth: 640,
        webformatHeight: 480,
        tags: "apple, fruit",
        pageURL: "https://pixabay.com/photos/apple-42/",
        user: "Author",
        downloads: 999,
      }] }),
    }));
    vi.stubGlobal("fetch", fetchMock);
    const signal = new AbortController().signal;
    const result = await searchPixabayImages({ query: "red apple & fruit", perPage: 5 }, signal);
    const [requestUrl, init] = fetchMock.mock.calls[0] as unknown as [URL, RequestInit];
    const url = new URL(String(requestUrl));
    expect(url.origin + url.pathname).toBe("https://pixabay.com/api/");
    expect(url.searchParams.get("q")).toBe("red apple & fruit");
    expect(url.searchParams.get("safesearch")).toBe("true");
    expect(url.searchParams.get("per_page")).toBe("5");
    expect(init).toEqual({ signal });
    expect(result).toEqual([{
      provider: "pixabay",
      providerImageId: 42,
      previewUrl: "https://cdn.pixabay.com/preview.jpg",
      displayUrl: "https://pixabay.com/get/apple_640.jpg",
      width: 640,
      height: 480,
      tags: ["apple", "fruit"],
      pageUrl: "https://pixabay.com/photos/apple-42/",
      authorName: "Author",
    }]);
  });

  it("fails safely without a key or with malformed data", async () => {
    vi.stubEnv("NEXT_PUBLIC_PIXABAY_API_KEY", "");
    await expect(searchPixabayImages({ query: "apple" })).rejects.toBeInstanceOf(PixabayConfigurationError);
    vi.stubEnv("NEXT_PUBLIC_PIXABAY_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ nope: [] }) })));
    await expect(searchPixabayImages({ query: "apple" })).rejects.toThrow("invalid response");
  });

  it("does not request empty terms and handles empty hits", async () => {
    vi.stubEnv("NEXT_PUBLIC_PIXABAY_API_KEY", "test-key");
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ hits: [] }) }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(searchPixabayImages({ query: " " })).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
    await expect(searchPixabayImages({ query: "apple" })).resolves.toEqual([]);
  });
});
