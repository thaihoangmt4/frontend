"use client";

import Image from "next/image";
import { ImageOff, LoaderCircle, Pause, Play, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { resolveLearningImageSource } from "../media";
import { useLearningAudio } from "../use-learning-audio";

export function LearningImage({
  src,
  alt,
  className = "aspect-video",
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  const resolvedSrc = resolveLearningImageSource(src);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [resolvedSrc]);

  if (!resolvedSrc || failed) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 ${className}`}
        role="img"
        aria-label={alt ? `${alt}. Image unavailable.` : "Image unavailable"}
      >
        <div className="p-4 text-center">
          <ImageOff aria-hidden="true" className="mx-auto h-8 w-8" />
          <span className="mt-2 block text-xs font-medium">Image unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-40 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800 ${className}`}>
      {!loaded && (
        <div
          className="absolute inset-0 z-10 animate-pulse bg-neutral-100 dark:bg-neutral-800"
          role="status"
          aria-label={`Loading ${alt}`}
        />
      )}
      <Image
        fill
        sizes="(max-width: 640px) 100vw, 640px"
        src={resolvedSrc}
        alt={alt}
        className={`object-cover transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export function LearningAudio({
  text,
  label,
  prominent = false,
}: {
  text: string;
  label: string;
  prominent?: boolean;
}) {
  const audio = useLearningAudio({
    text,
  });
  const [hasPlayed, setHasPlayed] = useState(false);
  const isPronunciation = label.toLowerCase().startsWith("pronunciation");
  const playLabel = isPronunciation ? "Play pronunciation" : "Play audio";
  const replayLabel = isPronunciation ? "Replay pronunciation" : "Replay audio";

  useEffect(() => {
    setHasPlayed(false);
  }, [text]);

  if (!text.trim()) {
    return (
      <p role="status" className="inline-flex min-h-11 items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
        <Volume2 aria-hidden="true" className="h-4 w-4" />
        Audio unavailable. You can continue without it.
      </p>
    );
  }

  if (audio.hasError) {
    return (
      <div role="status" className="flex flex-wrap items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
        <span className="inline-flex min-h-11 items-center gap-2">
          <Volume2 aria-hidden="true" className="h-4 w-4" />
          Audio unavailable. You can continue without it.
        </span>
        <Button type="button" variant="outline" size="sm" onClick={() => void audio.play()} aria-label={`Retry ${label}`}>
          Retry audio
        </Button>
      </div>
    );
  }

  async function togglePlayback() {
    if (audio.isPlaying) {
      audio.stop();
      return;
    }
    setHasPlayed(true);
    await audio.play();
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className={prominent ? "min-h-14 min-w-44 text-base" : "min-h-11"}
        onClick={togglePlayback}
        disabled={audio.isStarting}
        aria-label={`${audio.isPlaying ? "Stop" : hasPlayed ? "Replay" : audio.isLoading ? "Loading" : "Play"} ${label}`}
      >
        {audio.isStarting ? (
          <LoaderCircle aria-hidden="true" className="animate-spin" />
        ) : audio.isPlaying ? (
          <Pause aria-hidden="true" />
        ) : (
          <Play aria-hidden="true" />
        )}
        {audio.isStarting
          ? "Loading audio"
          : audio.status === "fallbackSpeaking"
            ? "Speaking"
            : audio.isPlaying
              ? "Playing"
              : hasPlayed
                ? replayLabel
                : playLabel}
      </Button>
      {audio.status === "fallbackSpeaking" && (
        <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400" role="status">
          Using browser speech
        </span>
      )}
    </div>
  );
}
