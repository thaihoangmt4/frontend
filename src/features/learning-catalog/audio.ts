import type { LearningStep } from "./learning.types";

const GOOGLE_TRANSLATE_TTS_ENDPOINT =
  "https://translate.google.com/translate_tts";
export const MAX_GOOGLE_TTS_TEXT_LENGTH = 200;

export type LearningSpeechInput = {
  text: string;
  language?: string;
};

export type ResolvedLearningSpeech = {
  url: string | null;
  text: string | null;
  language: string;
};

export type ResolvedLearningAudio = {
  text: string;
  language: string;
};

export function createGoogleTranslateTtsUrl(
  text: string,
  language = "en",
): string | null {
  const normalizedText = text.trim();
  if (
    normalizedText.length === 0 ||
    normalizedText.length > MAX_GOOGLE_TTS_TEXT_LENGTH
  ) {
    return null;
  }

  // Unofficial temporary Sprint 5 integration. Replace this with an official
  // TTS provider or generated audio storage before production.
  const url = new URL(GOOGLE_TRANSLATE_TTS_ENDPOINT);
  url.search = new URLSearchParams({
    ie: "UTF-8",
    client: "tw-ob",
    tl: language,
    q: normalizedText,
  }).toString();
  return url.toString();
}

export function resolveLearningSpeech({
  text,
  language = "en",
}: LearningSpeechInput): ResolvedLearningSpeech {
  const normalizedText = text.trim() || null;
  const url = normalizedText
    ? createGoogleTranslateTtsUrl(normalizedText, language)
    : null;

  return {
    url,
    text: normalizedText,
    language,
  };
}

export function resolveStepLearningAudio(
  step: LearningStep | undefined,
): ResolvedLearningAudio | null {
  if (step?.type === "instruction" && step.instruction?.vocabulary) {
    return {
      text: step.instruction.vocabulary.word.trim(),
      language: "en",
    };
  }

  // Audio questions currently expose no safe visible speech transcript.
  // Never infer one from answer options or evaluation data.

  return null;
}
