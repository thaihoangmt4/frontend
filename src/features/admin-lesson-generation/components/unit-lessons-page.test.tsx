import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminLessonGenerationService } from "../service";
import { UnitLessonsPage } from "./unit-lessons-page";

vi.mock("../service", () => ({
  adminLessonGenerationService: {
    getUnitLessons: vi.fn(),
    generateLesson: vi.fn(),
  },
}));

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <UnitLessonsPage unitId="unit-1" />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("UnitLessonsPage", () => {
  it("lists the unit lessons in backend order with an Add Lesson action", async () => {
    vi.mocked(adminLessonGenerationService.getUnitLessons).mockResolvedValue({
      unit: { id: "unit-1", code: "U1", title: "Food Basics" },
      items: [
        {
          id: "l1",
          code: "L1",
          title: "Basic Food Vocabulary",
          topic: "Food",
          order: 1,
          difficultyLevel: "Beginner",
        },
        {
          id: "l2",
          code: "L2",
          title: "Talking About Drinks",
          topic: "Drinks",
          order: 2,
          difficultyLevel: "Beginner",
        },
      ],
    });

    renderPage();

    expect(
      await screen.findByRole("heading", { name: "Food Basics" }),
    ).toBeInTheDocument();
    const lessons = screen.getAllByRole("listitem");
    expect(lessons[0]).toHaveTextContent("Basic Food Vocabulary");
    expect(lessons[1]).toHaveTextContent("Talking About Drinks");
    expect(screen.getByRole("button", { name: /Add Lesson/ })).toHaveAttribute(
      "href",
      "/admin/units/unit-1/lessons/new",
    );
    expect(screen.queryByText(/10 exercises/)).not.toBeInTheDocument();
  });

  it("invites the admin to generate the first lesson when the unit is empty", async () => {
    vi.mocked(adminLessonGenerationService.getUnitLessons).mockResolvedValue({
      unit: { id: "unit-1", code: "U1", title: "Food Basics" },
      items: [],
    });

    renderPage();

    expect(await screen.findByText("No lessons yet")).toBeInTheDocument();
  });
});
