import type { LearningStep, QuestionStep } from "./learning.types";

const OVERRIDES: Readonly<Record<string, string>> = {
  apple: "red apple fruit isolated",
  orange: "orange fruit isolated",
  banana: "yellow banana fruit isolated",
  grape: "purple grapes fruit isolated",
  strawberry: "red strawberry fruit isolated",
};

export function buildVocabularyImageSearchQuery(word: string, meaning?: string | null): string | null {
  void meaning;
  const normalized = word.trim().replace(/\s+/g, " ").toLowerCase();
  if (!normalized) return null;
  return (OVERRIDES[normalized] ?? `${normalized} object isolated`).slice(0, 100);
}

export function resolveQuestionPromptImageSearchTerm(question: QuestionStep): string | null {
  void question;
  // The current contract has no dedicated visible target term; generic prompts are ambiguous.
  return null;
}

export function resolveStepImageSearchQueries(step: LearningStep | undefined): string[] {
  if (!step) return [];
  if (step.type === "instruction" && step.instruction?.vocabulary) {
    const vocabulary = step.instruction.vocabulary;
    const query = buildVocabularyImageSearchQuery(vocabulary.word, vocabulary.meaning);
    return query ? [query] : [];
  }
  if (step.type !== "question" || !step.question) return [];
  const queries: string[] = [];
  const promptQuery = resolveQuestionPromptImageSearchTerm(step.question);
  if (promptQuery) queries.push(promptQuery);
  if (step.question.type === "imageMultipleChoice") {
    for (const option of step.question.options) {
      const query = buildVocabularyImageSearchQuery(option.text || option.accessibilityText || "");
      if (query) queries.push(query);
    }
  }
  return [...new Set(queries)];
}
