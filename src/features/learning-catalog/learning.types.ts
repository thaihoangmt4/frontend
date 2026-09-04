export type LearningStep =
  | { type: "instruction"; instruction: InstructionStep | null }
  | QuestionLearningStep;

export type QuestionLearningStep = {
  type: "question";
  instruction: null;
  question: QuestionStep;
};

export type InstructionStep = {
  title: string | null;
  text: string | null;
  vocabulary: VocabularyContent | null;
};

export type VocabularyContent = {
  id: string;
  word: string;
  meaning: string;
  phonetic: string | null;
  partOfSpeech: string;
  exampleSentence: string | null;
  exampleTranslation: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
};

export type QuestionStep = {
  type: string;
  promptAudioUrl: string | null;
  options: Array<{ audioUrl: string | null }>;
};