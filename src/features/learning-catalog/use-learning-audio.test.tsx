import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLearningAudio } from "./use-learning-audio";
import { useNextLearningAudioPreload } from "./use-next-learning-audio-preload";
import { instructionStep, questionStep } from "./test-fixtures";

type AudioEventHandler = EventListenerOrEventListenerObject;

class MockAudio {
  static instances: MockAudio[] = [];
  src = "";
  preload = "";
  paused = true;
  play = vi.fn(async () => undefined);
  pause = vi.fn(() => { this.paused = true; });
  load = vi.fn();
  removeAttribute = vi.fn((name: string) => {
    if (name === "src") this.src = "";
  });
  addEventListener = vi.fn((event: string, handler: AudioEventHandler) => {
    const listeners = this.listeners.get(event);
    if (listeners) listeners.add(handler);
    else this.listeners.set(event, new Set([handler]));
  });
  removeEventListener = vi.fn((event: string, handler: AudioEventHandler) => {
    this.listeners.get(event)?.delete(handler);
  });
  private listeners = new Map<string, Set<AudioEventHandler>>();

  constructor() {
    MockAudio.instances.push(this);
  }

  emit(event: string) {
    for (const handler of this.listeners.get(event) ?? []) {
      if (typeof handler === "function") handler(new Event(event));
      else handler.handleEvent(new Event(event));
    }
  }
}

class MockUtterance {
  lang = "";
  rate = 1;
  pitch = 1;
  voice: SpeechSynthesisVoice | null = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public text: string) {}
}

const speech = {
  cancel: vi.fn(),
  speak: vi.fn(),
  getVoices: vi.fn(() => [] as SpeechSynthesisVoice[]),
};

describe("useLearningAudio", () => {
  beforeEach(() => {
    MockAudio.instances = [];
    vi.clearAllMocks();
    vi.stubGlobal("Audio", MockAudio as unknown as typeof Audio);
    vi.stubGlobal(
      "SpeechSynthesisUtterance",
      MockUtterance as unknown as typeof SpeechSynthesisUtterance,
    );
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: speech,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("preloads a Google source without autoplay and cleans up on unmount", () => {
    const { unmount } = renderHook(() =>
      useLearningAudio({ text: "apple" }),
    );
    expect(MockAudio.instances).toHaveLength(1);
    expect(MockAudio.instances[0].src).toContain("translate.google.com/translate_tts");
    expect(MockAudio.instances[0].src).not.toContain("localhost");
    expect(MockAudio.instances[0].preload).toBe("auto");
    expect(MockAudio.instances[0].play).not.toHaveBeenCalled();
    unmount();
    expect(MockAudio.instances[0].pause).toHaveBeenCalled();
    expect(MockAudio.instances[0].removeEventListener).toHaveBeenCalled();
    expect(speech.cancel).toHaveBeenCalled();
  });

  it("activates Web Speech after Google failure", async () => {
    const { result } = renderHook(() =>
      useLearningAudio({ text: "apple" }),
    );
    await act(() => result.current.play());
    const googleAttempt = MockAudio.instances.at(-1)!;
    expect(googleAttempt.src).toContain("translate.google.com/translate_tts");
    act(() => googleAttempt.emit("error"));
    expect(speech.speak).toHaveBeenCalledOnce();
    expect(result.current.status).toBe("fallbackSpeaking");
  });

  it("exits passive preload loading after failure and keeps Play available", async () => {
    const { result } = renderHook(() => useLearningAudio({ text: "apple" }));
    const preload = MockAudio.instances[0];
    act(() => preload.emit("error"));
    expect(result.current.loadStatus).toBe("primaryFailed");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasError).toBe(false);
    expect(speech.speak).not.toHaveBeenCalled();

    await act(() => result.current.play());
    expect(speech.speak).toHaveBeenCalledOnce();
    expect(MockAudio.instances).toHaveLength(1);
  });

  it("activates speech after a Google playback timeout", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() =>
      useLearningAudio({ text: "apple", timeoutMs: 3000 }),
    );
    await act(() => result.current.play());
    act(() => vi.advanceTimersByTime(3000));
    expect(speech.speak).toHaveBeenCalledOnce();
  });

  it("reports unavailable when Web Speech is missing", async () => {
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: undefined,
    });
    const { result } = renderHook(() => useLearningAudio({ text: "apple" }));
    await act(() => result.current.play());
    act(() => MockAudio.instances.at(-1)!.emit("error"));
    await waitFor(() => expect(result.current.hasError).toBe(true));
  });

  it("allows replay after ended and stops the previous source on input change", async () => {
    const { result, rerender } = renderHook(
      ({ text }) => useLearningAudio({ text }),
      { initialProps: { text: "apple" } },
    );
    await act(() => result.current.play());
    const firstAttempt = MockAudio.instances.at(-1)!;
    act(() => firstAttempt.emit("playing"));
    act(() => firstAttempt.emit("ended"));
    await act(() => result.current.play());
    expect(MockAudio.instances.at(-1)).toBe(firstAttempt);
    expect(firstAttempt.play).toHaveBeenCalledTimes(2);

    const active = MockAudio.instances.at(-1)!;
    rerender({ text: "orange" });
    expect(active.pause).toHaveBeenCalled();
  });

  it("transitions from fallback completion to replay-ready and handles speech failure", async () => {
    const { result } = renderHook(() => useLearningAudio({ text: "apple" }));
    await act(() => result.current.play());
    act(() => MockAudio.instances[0].emit("error"));
    const utterance = speech.speak.mock.calls[0][0] as unknown as MockUtterance;
    act(() => utterance.onend?.());
    expect(result.current.playbackStatus).toBe("idle");
    await act(() => result.current.play());
    const retryUtterance = speech.speak.mock.calls[1][0] as unknown as MockUtterance;
    act(() => retryUtterance.onerror?.());
    expect(result.current.hasError).toBe(true);
  });

  it("preloads only the supplied immediate next step and never autoplays", () => {
    const { rerender } = renderHook(
      ({ current, next }) => useNextLearningAudioPreload(current, next),
      {
        initialProps: {
          current: questionStep("textMultipleChoice"),
          next: instructionStep(),
        },
      },
    );
    expect(MockAudio.instances).toHaveLength(1);
    expect(MockAudio.instances[0].play).not.toHaveBeenCalled();
    rerender({
      current: instructionStep("current-apple"),
      next: instructionStep("next-apple"),
    });
    expect(MockAudio.instances).toHaveLength(1);
  });
});
