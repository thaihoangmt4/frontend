import { beforeEach, describe, expect, it, vi } from "vitest";

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));

vi.mock("@/lib/axios", () => ({ axiosClient: { get, post } }));

import { learningService } from "./learning.service";

describe("learningService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("requests the encoded learning-flow route with cancellation", async () => {
    const response = { lesson: { id: "lesson/id" }, steps: [] };
    get.mockResolvedValue({ data: response });
    const controller = new AbortController();
    await expect(
      learningService.getLessonLearningFlow("lesson/id", controller.signal),
    ).resolves.toBe(response);
    expect(get).toHaveBeenCalledWith(
      "/api/lessons/lesson%2Fid/learning-flow",
      { signal: controller.signal },
    );
  });

  it("posts only the choice evaluation body to the encoded route", async () => {
    const body = { selectedOptionId: "option-1", textAnswer: null };
    post.mockResolvedValue({ data: { questionId: "question/id", isCorrect: true } });
    await learningService.evaluateQuestion("lesson/id", "question/id", body);
    expect(post).toHaveBeenCalledWith(
      "/api/lessons/lesson%2Fid/questions/question%2Fid/evaluate",
      body,
      { signal: undefined },
    );
    expect(post.mock.calls[0][1]).toEqual({
      selectedOptionId: "option-1",
      textAnswer: null,
    });
  });

  it("posts only the text evaluation body", async () => {
    const body = { selectedOptionId: null, textAnswer: "  BANANA  " };
    post.mockResolvedValue({ data: { questionId: "question-1", isCorrect: true } });
    await learningService.evaluateQuestion("lesson-1", "question-1", body);
    expect(post.mock.calls[0][1]).toEqual(body);
    expect(post.mock.calls[0][1]).not.toHaveProperty("correctAnswer");
    expect(post.mock.calls[0][1]).not.toHaveProperty("isCorrect");
    expect(post.mock.calls[0][1]).not.toHaveProperty("score");
  });
});
