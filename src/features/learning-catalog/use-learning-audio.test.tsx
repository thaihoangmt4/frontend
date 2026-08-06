import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLearningAudio } from "./use-learning-audio";

type Handler = EventListenerOrEventListenerObject;
class MockAudio {
  static instances: MockAudio[] = [];
  src = "";
  preload = "";
  play = vi.fn(async () => undefined);
  pause = vi.fn();
  load = vi.fn();
  removeAttribute = vi.fn((name: string) => {
    if (name === "src") this.src = "";
  });
  private listeners = new Map<string, Set<Handler>>();
  addEventListener = vi.fn((event: string, handler: Handler) => {
    const set = this.listeners.get(event) ?? new Set();
    set.add(handler);
    this.listeners.set(event, set);
  });
  removeEventListener = vi.fn((event: string, handler: Handler) =>
    this.listeners.get(event)?.delete(handler),
  );
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

  it("does not resolve or request audio until Play", async () => {
    const { result } = renderHook(() => useLearningAudio({ text: "apple" }));
    expect(MockAudio.instances).toHaveLength(0);
    await act(() => result.current.play());
    expect(MockAudio.instances).toHaveLength(1);
    expect(MockAudio.instances[0].src).toContain(
      "translate.google.com/translate_tts",
    );
    expect(MockAudio.instances[0].preload).toBe("none");
  });

  it("plays, becomes replay-ready, and reuses the same active source", async () => {
    const { result } = renderHook(() => useLearningAudio({ text: "apple" }));
    await act(() => result.current.play());
    const audio = MockAudio.instances[0];
    act(() => audio.emit("playing"));
    expect(result.current.isPlaying).toBe(true);
    act(() => audio.emit("ended"));
    await act(() => result.current.play());
    expect(audio.pause).toHaveBeenCalled();
    expect(MockAudio.instances).toHaveLength(2);
  });

  it("ignores rapid duplicate Play requests", async () => {
    const { result } = renderHook(() => useLearningAudio({ text: "apple" }));
    await act(async () => {
      await Promise.all([result.current.play(), result.current.play()]);
    });
    expect(MockAudio.instances).toHaveLength(1);
    expect(MockAudio.instances[0].play).toHaveBeenCalledOnce();
  });

  it("stops and cleans up on text change and unmount", async () => {
    const { result, rerender, unmount } = renderHook(
      ({ text }) => useLearningAudio({ text }),
      { initialProps: { text: "apple" } },
    );
    await act(() => result.current.play());
    const first = MockAudio.instances[0];
    rerender({ text: "orange" });
    expect(first.pause).toHaveBeenCalled();
    expect(first.removeEventListener).toHaveBeenCalled();
    await act(() => result.current.play());
    const second = MockAudio.instances[1];
    unmount();
    expect(second.pause).toHaveBeenCalled();
    expect(speech.cancel).toHaveBeenCalled();
  });

  it("falls back after Google failure and permits replay", async () => {
    const { result } = renderHook(() => useLearningAudio({ text: "apple" }));
    await act(() => result.current.play());
    act(() => MockAudio.instances[0].emit("error"));
    expect(speech.speak).toHaveBeenCalledOnce();
    const utterance = speech.speak.mock.calls[0][0] as unknown as MockUtterance;
    act(() => utterance.onend?.());
    await act(() => result.current.play());
    expect(MockAudio.instances).toHaveLength(2);
  });

  it("leaves loading and exposes retry after all playback mechanisms fail", async () => {
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: undefined,
    });
    const { result } = renderHook(() => useLearningAudio({ text: "apple" }));
    await act(() => result.current.play());
    act(() => MockAudio.instances[0].emit("error"));
    await waitFor(() => expect(result.current.hasError).toBe(true));
    expect(result.current.isLoading).toBe(false);
    await act(() => result.current.play());
    expect(MockAudio.instances).toHaveLength(2);
  });

  it("rejects empty pronunciation text without creating audio", async () => {
    const { result } = renderHook(() => useLearningAudio({ text: "  " }));
    await act(() => result.current.play());
    expect(result.current.hasError).toBe(true);
    expect(MockAudio.instances).toHaveLength(0);
  });
});
