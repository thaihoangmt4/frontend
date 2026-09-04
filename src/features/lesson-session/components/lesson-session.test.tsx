import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { lessonSessionService } from "../service";
import { LESSON_SESSION_STORAGE_KEY } from "../session-storage";
import type {
  LessonExercise,
  LessonSessionLesson,
  SubmitAnswerResponse,
} from "../types";
import { LessonSession } from "./lesson-session";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

vi.mock("../service", () => ({
  lessonSessionService: {
    getNextLesson: vi.fn(),
    submitAnswer: vi.fn(),
    completeLesson: vi.fn(),
  },
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ isAuthenticated: true, isLoading: false }),
}));

const LESSON: LessonSessionLesson = {
  id: "lesson-1",
  title: "Ordering at a Restaurant",
  description: null,
  learningObjectiveSummary:
    "Learn how to order simple food and ask for the bill.",
};

const EXERCISES: LessonExercise[] = Array.from({ length: 10 }, (_, index) => ({
  exerciseId: `exercise-${index + 1}`,
  exerciseType: "MultipleChoice",
  title: `Question ${index + 1}`,
  instruction: "Choose the best answer",
  displayOrder: index + 1,
  version: 1,
  content: {
    question: `Question ${index + 1}?`,
    options: [
      { id: "a", text: `Answer A${index + 1}` },
      { id: "b", text: `Answer B${index + 1}` },
    ],
  },
}));

function answerResult(
  exerciseId: string,
  isCorrect: boolean,
): SubmitAnswerResponse {
  return {
    exerciseId,
    isCorrect,
    status: isCorrect ? "Correct" : "Incorrect",
    score: isCorrect ? 100 : 0,
    feedback: null,
    explanation: isCorrect ? null : "Use the polite form.",
    correctAnswer: isCorrect ? null : "I'd like the bill, please.",
  };
}

function renderSession() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <LessonSession lesson={LESSON} exercises={EXERCISES} />
    </QueryClientProvider>,
  );
}

const user = userEvent.setup();

async function answerCurrent(index: number, correct: boolean) {
  await user.click(screen.getByRole("radio", { name: `Answer A${index}` }));
  await user.click(screen.getByRole("button", { name: "Check" }));
  await screen.findByRole("button", { name: /Continue/ });
  expect(correct ? "Correct!" : "Not quite.").toBeTruthy();
}

async function continueSession() {
  await user.click(screen.getByRole("button", { name: /Continue/ }));
}

beforeEach(() => {
  vi.clearAllMocks();
  window.sessionStorage.clear();
  vi.mocked(lessonSessionService.completeLesson).mockResolvedValue(undefined);
});

describe("LessonSession", () => {
  it("shows the lesson intro and starts the first of ten exercises", async () => {
    renderSession();

    expect(
      screen.getByRole("heading", { name: LESSON.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(LESSON.learningObjectiveSummary as string),
    ).toBeInTheDocument();
    expect(screen.getByText("10 exercises")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Start/ }));

    expect(screen.getByText("1 / 10")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuemax",
      "10",
    );
  });

  it("uses the backend verdict for feedback instead of deciding correctness locally", async () => {
    vi.mocked(lessonSessionService.submitAnswer).mockResolvedValue(
      answerResult("exercise-1", false),
    );
    renderSession();
    await user.click(screen.getByRole("button", { name: /Start/ }));

    await user.click(screen.getByRole("radio", { name: "Answer A1" }));
    await user.click(screen.getByRole("button", { name: "Check" }));

    expect(await screen.findByText("Not quite.")).toBeInTheDocument();
    expect(
      screen.getByText(/I'd like the bill, please./),
    ).toBeInTheDocument();
    expect(screen.getByText(/Use the polite form./)).toBeInTheDocument();
    expect(lessonSessionService.submitAnswer).toHaveBeenCalledWith(
      "exercise-1",
      1,
      { selectedOptionId: "a" },
    );
  });

  it("keeps progress based on ten core exercises and does not immediately repeat a wrong answer", async () => {
    vi.mocked(lessonSessionService.submitAnswer).mockImplementation(
      async (exerciseId) =>
        answerResult(exerciseId, exerciseId !== "exercise-1"),
    );
    renderSession();
    await user.click(screen.getByRole("button", { name: /Start/ }));

    await answerCurrent(1, false);
    await continueSession();

    expect(screen.getByText("2 / 10")).toBeInTheDocument();
    expect(screen.getByText("Question 2?")).toBeInTheDocument();
  });

  it("completes without a review phase when every answer is correct", async () => {
    vi.mocked(lessonSessionService.submitAnswer).mockImplementation(
      async (exerciseId) => answerResult(exerciseId, true),
    );
    renderSession();
    await user.click(screen.getByRole("button", { name: /Start/ }));

    for (let index = 1; index <= 10; index += 1) {
      await answerCurrent(index, true);
      await continueSession();
    }

    expect(screen.queryByText("Let’s review")).not.toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Lesson complete!" }),
    ).toBeInTheDocument();
    expect(lessonSessionService.completeLesson).toHaveBeenCalledWith("lesson-1");
    expect(
      window.sessionStorage.getItem(LESSON_SESSION_STORAGE_KEY),
    ).toBeNull();
  });

  it("reviews each wrong exercise exactly once and never requeues it", async () => {
    vi.mocked(lessonSessionService.submitAnswer).mockImplementation(
      async (exerciseId) =>
        answerResult(exerciseId, exerciseId !== "exercise-2"),
    );
    renderSession();
    await user.click(screen.getByRole("button", { name: /Start/ }));

    for (let index = 1; index <= 10; index += 1) {
      await answerCurrent(index, index !== 2);
      await continueSession();
    }

    expect(
      await screen.findByRole("heading", { name: "Let’s review" }),
    ).toBeInTheDocument();
    expect(screen.getByText("You have 1 question to review.")).toBeVisible();
    expect(lessonSessionService.completeLesson).not.toHaveBeenCalled();

    await continueSession();
    expect(screen.getByText("Question 2?")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();

    await answerCurrent(2, false);
    await continueSession();

    expect(
      await screen.findByRole("heading", { name: "Lesson complete!" }),
    ).toBeInTheDocument();
    const reviewAttempts = vi
      .mocked(lessonSessionService.submitAnswer)
      .mock.calls.filter(([exerciseId]) => exerciseId === "exercise-2");
    expect(reviewAttempts).toHaveLength(2);
    expect(lessonSessionService.completeLesson).toHaveBeenCalledTimes(1);
  });

  it("keeps the session recoverable when completion fails and clears it after a retry", async () => {
    vi.mocked(lessonSessionService.submitAnswer).mockImplementation(
      async (exerciseId) => answerResult(exerciseId, true),
    );
    vi.mocked(lessonSessionService.completeLesson)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(undefined);
    renderSession();
    await user.click(screen.getByRole("button", { name: /Start/ }));

    for (let index = 1; index <= 10; index += 1) {
      await answerCurrent(index, true);
      await continueSession();
    }

    expect(
      await screen.findByText("We couldn’t save your progress."),
    ).toBeInTheDocument();
    expect(
      window.sessionStorage.getItem(LESSON_SESSION_STORAGE_KEY),
    ).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Try Again" }));

    expect(
      await screen.findByRole("heading", { name: "Lesson complete!" }),
    ).toBeInTheDocument();
    expect(
      window.sessionStorage.getItem(LESSON_SESSION_STORAGE_KEY),
    ).toBeNull();
  });

  it("confirms before leaving and preserves the exercise when the learner keeps going", async () => {
    vi.mocked(lessonSessionService.submitAnswer).mockImplementation(
      async (exerciseId) => answerResult(exerciseId, true),
    );
    renderSession();
    await user.click(screen.getByRole("button", { name: /Start/ }));
    await answerCurrent(1, true);
    await continueSession();

    await user.click(screen.getByRole("button", { name: "Exit lesson" }));
    expect(
      await screen.findByText("Leave this lesson?"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Keep Learning" }));
    await waitFor(() =>
      expect(screen.queryByText("Leave this lesson?")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("2 / 10")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Exit lesson" }));
    await user.click(
      await screen.findByRole("button", { name: "Leave Lesson" }),
    );

    expect(push).toHaveBeenCalledWith("/dashboard");
    expect(
      window.sessionStorage.getItem(LESSON_SESSION_STORAGE_KEY),
    ).toBeNull();
    expect(lessonSessionService.completeLesson).not.toHaveBeenCalled();
  });

  it("restores the stored position after a refresh", async () => {
    window.sessionStorage.setItem(
      LESSON_SESSION_STORAGE_KEY,
      JSON.stringify({
        lessonId: "lesson-1",
        phase: "learning",
        currentIndex: 3,
        reviewQueue: ["exercise-1"],
        reviewIndex: 0,
        feedback: null,
      }),
    );

    renderSession();

    expect(screen.getByText("4 / 10")).toBeInTheDocument();
    expect(screen.getByText("Question 4?")).toBeInTheDocument();
  });
});
