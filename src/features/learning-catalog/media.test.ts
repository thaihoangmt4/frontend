import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveLearningImageSource } from "./media";

describe("resolveLearningImageSource", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("accepts the configured HTTPS asset domain", () => {
    vi.stubEnv("NEXT_PUBLIC_ASSETS_HOSTNAME", "assets.english.example");
    expect(resolveLearningImageSource("https://assets.english.example/vocabulary/apple.webp")).toBe(
      "https://assets.english.example/vocabulary/apple.webp",
    );
  });

  it("rejects third-party, insecure, protocol-relative, and malformed URLs", () => {
    vi.stubEnv("NEXT_PUBLIC_ASSETS_HOSTNAME", "assets.english.example");
    expect(resolveLearningImageSource("https://pixabay.com/apple.webp")).toBeNull();
    expect(resolveLearningImageSource("http://assets.english.example/apple.webp")).toBeNull();
    expect(resolveLearningImageSource("//assets.english.example/apple.webp")).toBeNull();
    expect(resolveLearningImageSource("not a URL")).toBeNull();
  });

  it("accepts a relative path only when it is explicitly supplied", () => {
    expect(resolveLearningImageSource("/media/vocabulary/apple.webp")).toBe(
      "/media/vocabulary/apple.webp",
    );
    expect(resolveLearningImageSource(null)).toBeNull();
  });
});
