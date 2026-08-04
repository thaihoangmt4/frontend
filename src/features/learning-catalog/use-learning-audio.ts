"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { resolveLearningSpeech, type LearningSpeechInput } from "./audio";

export type AudioLoadStatus = "idle" | "preloading" | "ready" | "primaryFailed";
export type AudioPlaybackStatus = "idle" | "starting" | "playing" | "fallbackSpeaking" | "unavailable";
export type UseLearningAudioOptions = LearningSpeechInput & { timeoutMs?: number };

const DEFAULT_TIMEOUT_MS = 3000;

export function useLearningAudio({ text, language = "en", timeoutMs = DEFAULT_TIMEOUT_MS }: UseLearningAudioOptions) {
  const speech = useMemo(() => resolveLearningSpeech({ text, language }), [language, text]);
  const [loadStatus, setLoadStatus] = useState<AudioLoadStatus>("idle");
  const [playbackStatus, setPlaybackStatus] = useState<AudioPlaybackStatus>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playRequestedRef = useRef(false);
  const fallbackAttemptedRef = useRef(false);
  const mountedRef = useRef(true);
  const failureHandlerRef = useRef<() => void>(() => undefined);
  const listenerCleanupRef = useRef<() => void>(() => undefined);

  const clearPlaybackTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const releaseAudio = useCallback(() => {
    clearPlaybackTimeout();
    const audio = audioRef.current;
    if (!audio) return;
    listenerCleanupRef.current();
    listenerCleanupRef.current = () => undefined;
    audioRef.current = null;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
  }, [clearPlaybackTimeout]);

  const createPrimaryAudio = useCallback((url: string) => {
    if (audioRef.current) return audioRef.current;
    const audio = new Audio();
    audio.preload = "auto";
    audio.src = url;
    audioRef.current = audio;

    const ready = () => {
      if (!mountedRef.current) return;
      setLoadStatus("ready");
      if (!playRequestedRef.current) setPlaybackStatus("idle");
    };
    const playing = () => {
      clearPlaybackTimeout();
      if (mountedRef.current) setPlaybackStatus("playing");
    };
    const ended = () => {
      clearPlaybackTimeout();
      playRequestedRef.current = false;
      fallbackAttemptedRef.current = false;
      if (mountedRef.current) setPlaybackStatus("idle");
    };
    const failed = () => failureHandlerRef.current();
    audio.addEventListener("canplay", ready);
    audio.addEventListener("playing", playing);
    audio.addEventListener("ended", ended);
    audio.addEventListener("error", failed);
    audio.addEventListener("stalled", failed);
    audio.addEventListener("abort", failed);
    listenerCleanupRef.current = () => {
      audio.removeEventListener("canplay", ready);
      audio.removeEventListener("playing", playing);
      audio.removeEventListener("ended", ended);
      audio.removeEventListener("error", failed);
      audio.removeEventListener("stalled", failed);
      audio.removeEventListener("abort", failed);
    };
    audio.load();
    return audio;
  }, [clearPlaybackTimeout]);

  const speakWithWebSpeech = useCallback(() => {
    releaseAudio();
    if (
      !speech.text ||
      typeof window === "undefined" ||
      !window.speechSynthesis ||
      typeof SpeechSynthesisUtterance === "undefined"
    ) {
      if (mountedRef.current) setPlaybackStatus("unavailable");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speech.text);
    utterance.lang = speech.language.toLowerCase() === "en" ? "en-US" : speech.language;
    utterance.rate = 1;
    utterance.pitch = 1;
    const prefix = utterance.lang.split("-")[0].toLowerCase();
    utterance.voice = window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith(prefix)) ?? null;
    utterance.onstart = () => mountedRef.current && setPlaybackStatus("fallbackSpeaking");
    utterance.onend = () => {
      playRequestedRef.current = false;
      if (mountedRef.current) setPlaybackStatus("idle");
    };
    utterance.onerror = () => {
      playRequestedRef.current = false;
      if (mountedRef.current) setPlaybackStatus("unavailable");
    };
    try {
      setPlaybackStatus("fallbackSpeaking");
      window.speechSynthesis.speak(utterance);
    } catch {
      playRequestedRef.current = false;
      if (mountedRef.current) setPlaybackStatus("unavailable");
    }
  }, [releaseAudio, speech.language, speech.text]);

  const handlePrimaryFailure = useCallback(() => {
    clearPlaybackTimeout();
    const shouldSpeak = playRequestedRef.current && !fallbackAttemptedRef.current;
    releaseAudio();
    if (mountedRef.current) setLoadStatus("primaryFailed");
    if (shouldSpeak) {
      fallbackAttemptedRef.current = true;
      speakWithWebSpeech();
    } else if (mountedRef.current) {
      setPlaybackStatus("idle");
    }
  }, [clearPlaybackTimeout, releaseAudio, speakWithWebSpeech]);

  failureHandlerRef.current = handlePrimaryFailure;

  const preload = useCallback(() => {
    if (!speech.url) {
      setLoadStatus("primaryFailed");
      setPlaybackStatus(speech.text ? "idle" : "unavailable");
      return;
    }
    setLoadStatus("preloading");
    createPrimaryAudio(speech.url);
  }, [createPrimaryAudio, speech.text, speech.url]);

  const play = useCallback(async () => {
    if (playbackStatus === "starting" || playbackStatus === "playing" || playbackStatus === "fallbackSpeaking") return;
    playRequestedRef.current = true;
    fallbackAttemptedRef.current = false;
    setPlaybackStatus("starting");
    if (!speech.url || loadStatus === "primaryFailed") {
      fallbackAttemptedRef.current = true;
      speakWithWebSpeech();
      return;
    }
    const audio = createPrimaryAudio(speech.url);
    clearPlaybackTimeout();
    timeoutRef.current = setTimeout(() => failureHandlerRef.current(), timeoutMs);
    try {
      await audio.play();
    } catch {
      failureHandlerRef.current();
    }
  }, [clearPlaybackTimeout, createPrimaryAudio, loadStatus, playbackStatus, speakWithWebSpeech, speech.url, timeoutMs]);

  const stop = useCallback(() => {
    playRequestedRef.current = false;
    fallbackAttemptedRef.current = false;
    clearPlaybackTimeout();
    audioRef.current?.pause();
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    if (mountedRef.current) setPlaybackStatus("idle");
  }, [clearPlaybackTimeout]);

  useEffect(() => {
    mountedRef.current = true;
    preload();
    return () => {
      mountedRef.current = false;
      playRequestedRef.current = false;
      releaseAudio();
      if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [preload, releaseAudio]);

  const status = playbackStatus === "unavailable"
    ? "error"
    : playbackStatus === "fallbackSpeaking"
      ? "fallbackSpeaking"
      : playbackStatus === "playing"
        ? "playing"
        : playbackStatus === "starting"
          ? "loading"
          : loadStatus === "ready"
            ? "ready"
            : "idle";

  return {
    status,
    loadStatus,
    playbackStatus,
    isLoading: playbackStatus === "starting",
    isStarting: playbackStatus === "starting",
    isPlaying: playbackStatus === "playing" || playbackStatus === "fallbackSpeaking",
    isReady: loadStatus === "ready" && playbackStatus === "idle",
    hasError: playbackStatus === "unavailable",
    play,
    stop,
    preload,
  } as const;
}
