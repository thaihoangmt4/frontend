import type {
  InstructionStep,
  LearningStep,
  QuestionOption,
  QuestionStep,
} from "./learning.types";

export const options: QuestionOption[] = [
  { id: "option-1", text: "apple", imageUrl: "/apple.webp", audioUrl: null, accessibilityText: "A red apple", displayOrder: 1 },
  { id: "option-2", text: "orange", imageUrl: null, audioUrl: null, accessibilityText: "An orange", displayOrder: 2 },
];

export const instruction: InstructionStep = {
  title: "Apple",
  text: "Listen and repeat.",
  vocabulary: {
    id: "vocabulary-1",
    word: "apple",
    meaning: "quả táo",
    phonetic: "/ˈæp.əl/",
    partOfSpeech: "Noun",
    exampleSentence: "This is an apple.",
    exampleTranslation: "Đây là một quả táo.",
    imageUrl: null,
    audioUrl: null,
  },
};

export function question(type: QuestionStep["type"]): QuestionStep {
  return {
    id: `question-${type}`,
    type,
    prompt: `Prompt for ${type}`,
    promptImageUrl: null,
    promptAudioUrl: type === "audioMultipleChoice" ? "/prompt.mp3" : null,
    options: type === "textInput" ? [] : options,
  };
}

export function instructionStep(id = "step-1"): LearningStep {
  return { id, type: "instruction", displayOrder: 1, isRequired: true, instruction, question: null };
}

export function questionStep(type: QuestionStep["type"] = "textMultipleChoice"): LearningStep {
  return { id: `step-${type}`, type: "question", displayOrder: 2, isRequired: true, instruction: null, question: question(type) };
}
