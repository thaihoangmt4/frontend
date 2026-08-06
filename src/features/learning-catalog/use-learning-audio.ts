"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { resolveLearningSpeech, type LearningSpeechInput } from "./audio";

export type AudioPlaybackStatus =
  "idle" | "starting" | "playing" | "fallbackSpeaking" | "unavailable";
export type UseLearningAudioOptions = LearningSpeechInput & {
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 3000;

export function useLearningAudio({
  text,
  language = "en",
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: UseLearningAudioOptions) {
  const [playbackStatus, setPlaybackStatus] =
    useState<AudioPlaybackStatus>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRequestRef = useRef(false);
  const mountedRef = useRef(true);
  const generationRef = useRef(0);
  const listenerCleanupRef = useRef<() => void>(() => undefined);

  const clearPlaybackTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const releaseAudio = useCallback(() => {
    generationRef.current += 1;
    activeRequestRef.current = false;
    clearPlaybackTimeout();
    const audio = audioRef.current;
    audioRef.current = null;
    listenerCleanupRef.current();
    listenerCleanupRef.current = () => undefined;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [clearPlaybackTimeout]);

  const fail = useCallback(() => {
    activeRequestRef.current = false;
    clearPlaybackTimeout();
    if (mountedRef.current) setPlaybackStatus("unavailable");
  }, [clearPlaybackTimeout]);

  const speakWithWebSpeech = useCallback(
    (speechText: string, speechLanguage: string, generation: number) => {
      const synthesis =
        typeof window === "undefined" ? undefined : window.speechSynthesis;
      if (!synthesis || typeof SpeechSynthesisUtterance === "undefined") {
        fail();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang =
        speechLanguage.toLowerCase() === "en" ? "en-US" : speechLanguage;
      utterance.rate = 1;
      utterance.pitch = 1;
      const prefix = utterance.lang.split("-")[0].toLowerCase();
      utterance.voice =
        synthesis
          .getVoices()
          .find((voice) => voice.lang.toLowerCase().startsWith(prefix)) ?? null;
      utterance.onstart = () => {
        if (mountedRef.current && generation === generationRef.current)
          setPlaybackStatus("fallbackSpeaking");
      };
      utterance.onend = () => {
        activeRequestRef.current = false;
        if (mountedRef.current && generation === generationRef.current)
          setPlaybackStatus("idle");
      };
      utterance.onerror = fail;
      try {
        setPlaybackStatus("fallbackSpeaking");
        synthesis.speak(utterance);
      } catch {
        fail();
      }
    },
    [fail],
  );

  const play = useCallback(async () => {
    if (activeRequestRef.current) return;
    const speech = resolveLearningSpeech({ text, language });
    if (!speech.url || !speech.text) {
      fail();
      return;
    }

    releaseAudio();
    activeRequestRef.current = true;
    const generation = generationRef.current;
    setPlaybackStatus("starting");
    const audio = new Audio();
    audio.preload = "none";
    audio.src = speech.url;
    audioRef.current = audio;

    let fallbackStarted = false;
    const primaryFailed = () => {
      if (fallbackStarted || generation !== generationRef.current) return;
      fallbackStarted = true;
      clearPlaybackTimeout();
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
      speakWithWebSpeech(speech.text!, speech.language, generation);
    };
    const playing = () => {
      clearPlaybackTimeout();
      if (mountedRef.current && generation === generationRef.current)
        setPlaybackStatus("playing");
    };
    const ended = () => {
      activeRequestRef.current = false;
      if (mountedRef.current && generation === generationRef.current)
        setPlaybackStatus("idle");
    };
    audio.addEventListener("playing", playing);
    audio.addEventListener("ended", ended);
    audio.addEventListener("error", primaryFailed, { once: true });
    audio.addEventListener("stalled", primaryFailed, { once: true });
    audio.addEventListener("abort", primaryFailed, { once: true });
    listenerCleanupRef.current = () => {
      audio.removeEventListener("playing", playing);
      audio.removeEventListener("ended", ended);
      audio.removeEventListener("error", primaryFailed);
      audio.removeEventListener("stalled", primaryFailed);
      audio.removeEventListener("abort", primaryFailed);
    };
    timeoutRef.current = setTimeout(primaryFailed, timeoutMs);
    try {
      await audio.play();
    } catch {
      primaryFailed();
    }
  }, [
    clearPlaybackTimeout,
    fail,
    language,
    releaseAudio,
    speakWithWebSpeech,
    text,
    timeoutMs,
  ]);

  const stop = useCallback(() => {
    releaseAudio();
    if (mountedRef.current) setPlaybackStatus("idle");
  }, [releaseAudio]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      releaseAudio();
    };
  }, [language, releaseAudio, text]);

  const isPlaying =
    playbackStatus === "playing" || playbackStatus === "fallbackSpeaking";
  return {
    status:
      playbackStatus === "unavailable"
        ? "error"
        : playbackStatus === "starting"
          ? "loading"
          : playbackStatus,
    playbackStatus,
    isLoading: playbackStatus === "starting",
    isStarting: playbackStatus === "starting",
    isPlaying,
    isReady: playbackStatus === "idle",
    hasError: playbackStatus === "unavailable",
    play,
    stop,
  } as const;
}
