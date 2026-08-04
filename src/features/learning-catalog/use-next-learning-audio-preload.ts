"use client";

import { useEffect } from "react";
import { resolveLearningSpeech, resolveStepLearningAudio } from "./audio";
import type { LearningStep } from "./learning.types";

export function useNextLearningAudioPreload(
  currentStep: LearningStep | undefined,
  nextStep: LearningStep | undefined,
) {
  useEffect(() => {
    if (typeof Audio === "undefined") return;
    const playable = resolveStepLearningAudio(nextStep);
    if (!playable) return;
    const currentPlayable = resolveStepLearningAudio(currentStep);
    if (
      currentPlayable?.text.trim().toLowerCase() ===
      playable.text.trim().toLowerCase()
    ) {
      return;
    }
    const speech = resolveLearningSpeech({
      text: playable.text,
      language: playable.language,
    });
    if (!speech.url) return;

    const audio = new Audio();
    audio.preload = "auto";
    audio.src = speech.url;
    audio.load();
    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    };
  }, [currentStep, nextStep]);
}
