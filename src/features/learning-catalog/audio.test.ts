import { describe, expect, it } from "vitest";
import {
  createGoogleTranslateTtsUrl,
  resolveLearningSpeech,
  resolveStepLearningAudio,
} from "./audio";
import { instructionStep, questionStep } from "./test-fixtures";

describe("learning audio resolution", () => {
  it("always resolves valid visible text to Google Translate", () => {
    const result = resolveLearningSpeech({ text: "apple" });
    expect(result.url).toContain("translate.google.com/translate_tts");
    expect(result.text).toBe("apple");
  });

  it("creates a deterministic, safely encoded Google URL without cache busting", () => {
    const first = createGoogleTranslateTtsUrl("  What's an apple? & orange  ");
    const second = createGoogleTranslateTtsUrl("What's an apple? & orange");
    expect(first).toBe(second);
    const url = new URL(first!);
    expect(url.searchParams.get("q")).toBe("What's an apple? & orange");
    expect(url.searchParams.get("tl")).toBe("en");
    expect(url.searchParams.get("client")).toBe("tw-ob");
    expect(url.searchParams.has("timestamp")).toBe(false);
    expect(url.searchParams.has("cacheBust")).toBe(false);
  });

  it("rejects empty and excessively long Google text", () => {
    expect(createGoogleTranslateTtsUrl("   ")).toBeNull();
    expect(createGoogleTranslateTtsUrl("a".repeat(201))).toBeNull();
  });

  it("resolves vocabulary text without reading answer data", () => {
    const step = instructionStep();
    step.instruction!.vocabulary!.audioUrl = "/invalid/backend/apple.mp3";
    expect(resolveStepLearningAudio(step)).toEqual({
      text: "apple",
      language: "en",
    });
  });

  it("does not invent a transcript for an audio question", () => {
    const withAudio = questionStep("audioMultipleChoice");
    withAudio.question!.promptAudioUrl = "/invalid/backend/prompt.mp3";
    withAudio.question!.options[0].audioUrl = "/invalid/backend/option.mp3";
    expect(resolveStepLearningAudio(withAudio)).toBeNull();
  });
});
