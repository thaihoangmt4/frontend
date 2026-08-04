import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { LessonPlayerPage } from "./lesson-player-page";

const { queryState, back } = vi.hoisted(() => ({
  queryState: {
    isPending: false,
    isError: false,
    isFetching: false,
    error: null as unknown,
    data: undefined,
    refetch: vi.fn(),
  },
  back: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ back }) }));
vi.mock("../learning.hooks", async (importOriginal) => {
  const original = await importOriginal<typeof import("../learning.hooks")>();
  return { ...original, useLessonLearningFlowQuery: () => queryState };
});

describe("LessonPlayerPage", () => {
  it("shows a safe unavailable state for an invalid lesson id", () => {
    render(<LessonPlayerPage lessonId="invalid" />);
    expect(screen.getByRole("heading", { name: "Lesson unavailable" })).toBeInTheDocument();
  });

  it("shows a retryable network error without exposing the raw error", async () => {
    queryState.isError = true;
    queryState.error = new Error("private server details");
    const user = userEvent.setup();
    render(<LessonPlayerPage lessonId="11111111-1111-4111-8111-111111111111" />);
    expect(screen.getByRole("heading", { name: "We couldn't load this lesson" })).toBeInTheDocument();
    expect(screen.queryByText("private server details")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(queryState.refetch).toHaveBeenCalledOnce();
  });
});
