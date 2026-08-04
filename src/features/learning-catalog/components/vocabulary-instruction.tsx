"use client";

import { LearningAudio, LearningImage } from "./learning-media";
import type { InstructionStep } from "../learning.types";
import { buildVocabularyImageSearchQuery } from "../image-search";

export function VocabularyInstruction({ instruction }: { instruction: InstructionStep }) {
  const vocabulary = instruction.vocabulary;

  if (!vocabulary) {
    return <UnsupportedContent message="This instruction is not available." />;
  }

  return (
    <article className="w-full max-w-2xl" aria-labelledby="lesson-player-heading">
      {instruction.title && (
        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
          {instruction.title}
        </p>
      )}
      <div className="mt-4 grid gap-6 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:items-center">
        <LearningImage
          searchQuery={buildVocabularyImageSearchQuery(vocabulary.word, vocabulary.meaning)}
          alt={`Illustration for the word ${vocabulary.word}`}
          className="aspect-square"
        />
        <div>
          <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            {vocabulary.partOfSpeech}
          </p>
          <h1 id="lesson-player-heading" className="mt-1 text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {vocabulary.word}
          </h1>
          {vocabulary.phonetic && (
            <p className="mt-2 text-lg text-neutral-500 dark:text-neutral-400">
              {vocabulary.phonetic}
            </p>
          )}
          <div className="mt-4">
            <LearningAudio
              text={vocabulary.word}
              label={`pronunciation for ${vocabulary.word}`}
            />
          </div>
          <p className="mt-5 text-xl font-semibold text-neutral-800 dark:text-neutral-200">
            {vocabulary.meaning}
          </p>
        </div>
      </div>
      {instruction.text && (
        <p className="mt-6 leading-relaxed text-neutral-600 dark:text-neutral-300">
          {instruction.text}
        </p>
      )}
      {vocabulary.exampleSentence && (
        <blockquote className="mt-6 rounded-xl border-l-4 border-blue-500 bg-blue-50/60 p-4 dark:bg-blue-950/30">
          <p className="font-medium text-neutral-800 dark:text-neutral-200">
            {vocabulary.exampleSentence}
          </p>
          {vocabulary.exampleTranslation && (
            <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
              {vocabulary.exampleTranslation}
            </p>
          )}
        </blockquote>
      )}
    </article>
  );
}

export function UnsupportedContent({ message }: { message: string }) {
  return (
    <div className="w-full max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200" role="status">
      <h1 id="lesson-player-heading" className="text-xl font-semibold">Unsupported lesson content</h1>
      <p className="mt-2 text-sm leading-relaxed">{message} You can continue to the next step.</p>
    </div>
  );
}
