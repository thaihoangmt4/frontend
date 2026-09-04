import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, AxiosHeaders } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminLessonGenerationService } from "../service";
import { AddLessonPage } from "./add-lesson-page";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

vi.mock("../service", () => ({
  adminLessonGenerationService: {
    generateLesson: vi.fn(),
  },
}));

const toastSuccess = vi.fn();
vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({ success: toastSuccess, error: vi.fn() }),
}));

const settingsEnabled = { data: { enabled: true } };
let settingsState: { data?: { enabled: boolean } } = settingsEnabled;
vi.mock("@/features/admin-lesson-generation-settings", () => ({
  useLessonGenerationSettings: () => settingsState,
}));

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <AddLessonPage unitId="unit-1" />
    </QueryClientProvider>,
  );
}

const user = userEvent.setup();

beforeEach(() => {
  vi.clearAllMocks();
  settingsState = settingsEnabled;
});

describe("AddLessonPage", () => {
  it("shows only the unit context and a generate action", async () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Add Lesson" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Unit unit-1")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Generate Lesson/ }),
    ).toBeEnabled();

    for (const label of [
      /Title/i,
      /Topic/i,
      /Learning Objective/i,
      /Exercise count/i,
      /Initial Delay/i,
      /Interval/i,
      /Minimum/i,
      /Target/i,
      /Maximum/i,
    ]) {
      expect(screen.queryByLabelText(label)).not.toBeInTheDocument();
    }
  });

  it("generates the lesson for the unit, toasts, and returns to the lesson list", async () => {
    vi.mocked(adminLessonGenerationService.generateLesson).mockResolvedValue({
      lessonId: "lesson-9",
      title: "Ordering at a Restaurant",
      order: 4,
    });
    renderPage();

    await user.click(screen.getByRole("button", { name: /Generate Lesson/ }));

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/admin/units/unit-1/lessons"),
    );
    expect(adminLessonGenerationService.generateLesson).toHaveBeenCalledWith(
      "unit-1",
    );
    expect(toastSuccess).toHaveBeenCalledWith(
      "“Ordering at a Restaurant” generated successfully.",
    );
  });

  it("disables the button while generating and ignores duplicate clicks", async () => {
    let resolveGeneration: (value: {
      lessonId: string;
      title: string;
      order: number;
    }) => void = () => {};
    vi.mocked(adminLessonGenerationService.generateLesson).mockReturnValue(
      new Promise((resolve) => {
        resolveGeneration = resolve;
      }),
    );
    renderPage();

    const button = screen.getByRole("button", { name: /Generate Lesson/ });
    await user.click(button);

    const pendingButton = await screen.findByRole("button", {
      name: /Generating lesson…/,
    });
    expect(pendingButton).toBeDisabled();

    await user.click(pendingButton);
    expect(adminLessonGenerationService.generateLesson).toHaveBeenCalledTimes(1);

    resolveGeneration({ lessonId: "l", title: "New lesson", order: 1 });
    await waitFor(() => expect(push).toHaveBeenCalled());
  });

  it("stays on the page with a retryable error when generation fails", async () => {
    vi.mocked(adminLessonGenerationService.generateLesson)
      .mockRejectedValueOnce(new Error("invalid lesson"))
      .mockResolvedValueOnce({ lessonId: "l", title: "Retry", order: 2 });
    renderPage();

    await user.click(screen.getByRole("button", { name: /Generate Lesson/ }));

    expect(
      await screen.findByText("Unable to generate a valid lesson. Please try again."),
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();

    const retryButton = screen.getByRole("button", {
      name: /Generate Lesson/,
    });
    expect(retryButton).toBeEnabled();

    await user.click(retryButton);
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/admin/units/unit-1/lessons"),
    );
  });

  it("explains the backend rejection when generation is turned off server-side", async () => {
    vi.mocked(adminLessonGenerationService.generateLesson).mockRejectedValue(
      new AxiosError("disabled", "409", undefined, undefined, {
        status: 409,
        statusText: "Forbidden",
        data: {},
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      }),
    );
    renderPage();

    await user.click(screen.getByRole("button", { name: /Generate Lesson/ }));

    expect(
      await screen.findByText(
        "AI Lesson Generation is currently disabled. Enable it in Settings and try again.",
      ),
    ).toBeInTheDocument();
  });

  it("disables generation while the AI Lesson Generation setting is off", async () => {
    settingsState = { data: { enabled: false } };
    renderPage();

    expect(
      screen.getByRole("button", { name: /Generate Lesson/ }),
    ).toBeDisabled();
    expect(
      screen.getByText(/AI Lesson Generation is currently disabled/),
    ).toBeInTheDocument();
  });
});
