import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import type { LearningActivity } from "../types";
import { ExerciseInput } from "./exercise-input";

class MockAudio {
  static instances: MockAudio[] = [];
  src = "";
  preload = "";
  play = vi.fn(async () => undefined);
  pause = vi.fn();
  load = vi.fn();
  removeAttribute = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  constructor() {
    MockAudio.instances.push(this);
  }
}
const activity: LearningActivity = {
  activityId: "activity",
  exerciseId: "exercise",
  activityType: "Lesson",
  exerciseType: "AudioMatching",
  title: "Listen",
  instruction: "Choose",
  difficulty: "Beginner",
  displayOrder: 1,
  exerciseVersion: 1,
  isRequired: true,
  status: "Pending",
  latestResult: null,
  content: {
    pronunciationText: "How are you?",
    options: [
      { id: "one", text: "How are you?" },
      { id: "two", text: "Where are you?" },
    ],
  },
};
beforeEach(() => {
  MockAudio.instances = [];
  vi.stubGlobal("Audio", MockAudio as unknown as typeof Audio);
});

it("uses lazy Google TTS for Audio Matching without a static audio URL", async () => {
  render(
    <ExerciseInput activity={activity} disabled={false} onAnswer={vi.fn()} />,
  );
  expect(MockAudio.instances).toHaveLength(0);
  expect(screen.queryByText(/audio is unavailable/i)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Play pronunciation" }));
  expect(MockAudio.instances).toHaveLength(1);
  expect(MockAudio.instances[0].src).toContain(
    "translate.google.com/translate_tts",
  );
  expect(MockAudio.instances[0].src).toContain("q=How+are+you%3F");
  fireEvent.click(screen.getByLabelText("Where are you?"));
  expect(screen.getByLabelText("Where are you?")).toBeChecked();
});
