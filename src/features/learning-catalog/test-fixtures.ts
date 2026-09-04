import type {
  InstructionStep,
  LearningStep,
  QuestionLearningStep,
} from "./learning.types";

export function instructionStep(): LearningStep {
  const instruction: InstructionStep = {
    title: "Vocabulary",
    text: "Learn this word.",
    vocabulary: {
      id: "word-1",
      word: "apple",
      meaning: "a fruit",
      phonetic: null,
      partOfSpeech: "noun",
      exampleSentence: "I ate an apple.",
      exampleTranslation: null,
      imageUrl: null,
      audioUrl: null,
    },
  };
  return { type: "instruction", instruction };
}

export function questionStep(type = "audioMultipleChoice"): QuestionLearningStep {
  return {
    type: "question",
    instruction: null,
    question: { type, promptAudioUrl: null, options: [{ audioUrl: null }] },
  };
}