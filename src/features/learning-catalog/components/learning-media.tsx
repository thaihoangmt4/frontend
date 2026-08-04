"use client";

import Image, { type ImageLoaderProps } from "next/image";
import { ImageOff, Pause, Play, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { resolveLearningMediaUrl } from "../media";

function mediaLoader({ src }: ImageLoaderProps): string {
  return src;
}

export function LearningImage({
  src,
  alt,
  className = "aspect-video",
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  const resolvedSrc = resolveLearningMediaUrl(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [resolvedSrc]);

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
    <div className={`relative overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800 ${className}`}>
      <Image
        loader={mediaLoader}
        unoptimized
        fill
        sizes="(max-width: 640px) 100vw, 640px"
        src={resolvedSrc}
        alt={alt}
        className="object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export function LearningAudio({
  src,
  label,
  prominent = false,
}: {
  src: string | null;
  label: string;
  prominent?: boolean;
}) {
  const resolvedSrc = resolveLearningMediaUrl(src);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setHasError(false);
  }, [resolvedSrc]);

  if (!resolvedSrc || hasError) {
    return (
      <p role="status" className="inline-flex min-h-11 items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
        <Volume2 aria-hidden="true" className="h-4 w-4" />
        Audio unavailable. You can continue without it.
      </p>
    );
  }

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch {
      setHasError(true);
    }
  }

  return (
    <div>
      <audio
        ref={audioRef}
        src={resolvedSrc}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => setHasError(true)}
      />
      <Button
        type="button"
        variant="outline"
        size="lg"
        className={prominent ? "min-h-14 min-w-44 text-base" : "min-h-11"}
        onClick={togglePlayback}
        aria-label={`${isPlaying ? "Pause" : "Play"} ${label}`}
      >
        {isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        {isPlaying ? "Pause audio" : "Play audio"}
      </Button>
    </div>
  );
}
