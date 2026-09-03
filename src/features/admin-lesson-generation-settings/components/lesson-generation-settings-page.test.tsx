import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  useLessonGenerationSettings,
  useUpdateLessonGenerationSettings,
} from "../hooks";
import type { LessonGenerationSettings } from "../types";
import { LessonGenerationSettingsPage } from "./lesson-generation-settings-page";

vi.mock("../hooks", () => ({
  useLessonGenerationSettings: vi.fn(),
  useUpdateLessonGenerationSettings: vi.fn(),
}));

const toastSuccess = vi.fn();
vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({ success: toastSuccess, error: vi.fn() }),
}));

const SETTINGS: LessonGenerationSettings = {
  enabled: true,
  updatedAtUtc: "2026-08-26T08:00:00Z",
  updatedByUserId: "admin-user",
  version: "v1",
};

const refetch = vi.fn();
const mutateAsync = vi.fn();
const user = userEvent.setup();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useLessonGenerationSettings).mockReturnValue({
    data: SETTINGS,
    isPending: false,
    isError: false,
    isFetching: false,
    error: null,
    refetch,
  } as unknown as ReturnType<typeof useLessonGenerationSettings>);
  vi.mocked(useUpdateLessonGenerationSettings).mockReturnValue({
    isPending: false,
    mutateAsync,
  } as unknown as ReturnType<typeof useUpdateLessonGenerationSettings>);
});

describe("LessonGenerationSettingsPage", () => {
  it("exposes only the enabled switch and no scheduling or inventory controls", () => {
    render(<LessonGenerationSettingsPage />);

    expect(
      screen.getByRole("heading", { name: "Lesson Generation" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("switch")).toBeChecked();
    expect(screen.queryByText(/Exercise Generation/)).not.toBeInTheDocument();

    for (const label of [
      /Initial Delay/i,
      /Interval/i,
      /Minimum/i,
      /Target/i,
      /Maximum/i,
    ]) {
      expect(screen.queryByLabelText(label)).not.toBeInTheDocument();
    }
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  });

  it("saves the toggle after the disable confirmation", async () => {
    mutateAsync.mockResolvedValue({ ...SETTINGS, enabled: false, version: "v2" });
    render(<LessonGenerationSettingsPage />);

    await user.click(screen.getByRole("switch"));
    await user.click(
      await screen.findByRole("button", { name: "Disable" }),
    );

    expect(
      screen.getByText(/AI Lesson Generation is currently disabled/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Save settings" }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        enabled: false,
        version: "v1",
      }),
    );
    expect(toastSuccess).toHaveBeenCalledWith(
      "Lesson generation settings updated.",
    );
  });
});
