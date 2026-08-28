import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  useExerciseGenerationSettings,
  useUpdateExerciseGenerationSettings,
} from "../hooks";
import type { ExerciseGenerationSettings } from "../types";
import { ExerciseGenerationSettingsPage } from "./exercise-generation-settings-page";

vi.mock("../hooks", () => ({
  useExerciseGenerationSettings: vi.fn(),
  useUpdateExerciseGenerationSettings: vi.fn(),
}));

const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({
    success: toastSuccess,
    error: toastError,
  }),
}));

const SETTINGS: ExerciseGenerationSettings = {
  enabled: true,
  initialDelayMinutes: 10,
  intervalHours: 24,
  minimumExerciseThreshold: 20,
  targetExerciseCount: 40,
  maxExercisesPerLessonPerRun: 50,
  updatedAtUtc: "2026-08-25T10:10:00Z",
  updatedByUserId: "d5ae49a6-fd75-4c30-b833-c85640f59dbc",
  version: "22df927c-1938-443e-8567-3485882eec41",
};

const refetch = vi.fn();
const mutateAsync = vi.fn();

describe("ExerciseGenerationSettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useExerciseGenerationSettings).mockReturnValue({
      data: SETTINGS,
      isPending: false,
      isError: false,
      isFetching: false,
      error: null,
      refetch,
    } as unknown as ReturnType<typeof useExerciseGenerationSettings>);
    vi.mocked(useUpdateExerciseGenerationSettings).mockReturnValue({
      isPending: false,
      mutateAsync,
    } as unknown as ReturnType<typeof useUpdateExerciseGenerationSettings>);
  });

  it("shows a loading state while current settings are loading", () => {
    vi.mocked(useExerciseGenerationSettings).mockReturnValue({
      isPending: true,
      isError: false,
    } as unknown as ReturnType<typeof useExerciseGenerationSettings>);

    render(<ExerciseGenerationSettingsPage />);

    expect(
      screen.getByRole("status", {
        name: "Loading exercise generation settings",
      }),
    ).toBeInTheDocument();
  });

  it("loads the enabled state and five authoritative numeric settings", () => {
    render(<ExerciseGenerationSettingsPage />);

    expect(
      screen.getByRole("switch", { name: "AI Exercise Generation" }),
    ).toBeChecked();
    expect(screen.getByText("Enabled")).toBeInTheDocument();
    expect(
      screen.getByText("Scheduled AI exercise generation is active."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Initial Delay Minutes")).toHaveValue(10);
    expect(screen.getByLabelText("Interval Hours")).toHaveValue(24);
    expect(screen.getByLabelText("Minimum Exercise Threshold")).toHaveValue(20);
    expect(screen.getByLabelText("Target Exercise Count")).toHaveValue(40);
    expect(
      screen.getByLabelText("Maximum Exercises Per Lesson Per Run"),
    ).toHaveValue(50);
    expect(
      screen.queryByLabelText("Generation Batch Size"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save settings" }),
    ).toBeDisabled();
  });

  it("enables Save after a valid modification", async () => {
    const user = userEvent.setup();
    render(<ExerciseGenerationSettingsPage />);

    await replaceNumber(user, "Interval Hours", "12");

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Save settings" }),
      ).toBeEnabled(),
    );
  });

  it("renders the disabled state from the GET response", () => {
    mockSettings({ ...SETTINGS, enabled: false });

    render(<ExerciseGenerationSettingsPage />);

    expect(
      screen.getByRole("switch", { name: "AI Exercise Generation" }),
    ).not.toBeChecked();
    expect(screen.getByText("Disabled")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Scheduled AI exercise generation is paused. Existing exercises remain available to learners.",
      ),
    ).toBeInTheDocument();
  });

  it("asks for confirmation before disabling and Cancel keeps it enabled", async () => {
    const user = userEvent.setup();
    render(<ExerciseGenerationSettingsPage />);

    await openDisableConfirmation(user);
    expect(
      screen.getByText(/Scheduled AI exercise generation will stop/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.getByRole("switch", { name: "AI Exercise Generation" }),
    ).toBeChecked();
    expect(
      screen.getByRole("button", { name: "Save settings" }),
    ).toBeDisabled();
  });

  it("confirming Disable updates local form state without saving immediately", async () => {
    const user = userEvent.setup();
    render(<ExerciseGenerationSettingsPage />);

    await openDisableConfirmation(user);
    await user.click(screen.getByRole("button", { name: "Disable" }));

    expect(
      screen.getByRole("switch", { name: "AI Exercise Generation" }),
    ).not.toBeChecked();
    expect(screen.getByText("Pending save")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save settings" })).toBeEnabled();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("enables generation without a confirmation dialog", async () => {
    const user = userEvent.setup();
    mockSettings({ ...SETTINGS, enabled: false });
    render(<ExerciseGenerationSettingsPage />);

    await user.click(
      screen.getByRole("switch", { name: "AI Exercise Generation" }),
    );

    expect(
      screen.getByRole("switch", { name: "AI Exercise Generation" }),
    ).toBeChecked();
    expect(
      screen.queryByRole("heading", {
        name: "Disable AI Exercise Generation?",
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save settings" })).toBeEnabled();
  });

  it("validates target count against the minimum threshold", async () => {
    const user = userEvent.setup();
    render(<ExerciseGenerationSettingsPage />);

    await replaceNumber(user, "Target Exercise Count", "10");

    expect(
      await screen.findByText(
        "Target exercise count must be greater than or equal to the minimum threshold.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save settings" }),
    ).toBeDisabled();
  });

  it("saves the version and displays authoritative returned values", async () => {
    const user = userEvent.setup();
    const updated = { ...SETTINGS, intervalHours: 12, version: "new-version" };
    mutateAsync.mockResolvedValue(updated);
    render(<ExerciseGenerationSettingsPage />);

    await replaceNumber(user, "Interval Hours", "8");
    await user.click(
      await screen.findByRole("button", { name: "Save settings" }),
    );

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        initialDelayMinutes: 10,
        intervalHours: 8,
        minimumExerciseThreshold: 20,
        targetExerciseCount: 40,
        maxExercisesPerLessonPerRun: 50,
        enabled: true,
        version: SETTINGS.version,
      }),
    );
    expect(mutateAsync.mock.calls[0][0]).not.toHaveProperty(
      "generationBatchSize",
    );
    expect(await screen.findByLabelText("Interval Hours")).toHaveValue(12);
    expect(toastSuccess).toHaveBeenCalledWith(
      "Exercise generation settings updated.",
    );
  });

  it("maps backend validation errors to fields", async () => {
    const user = userEvent.setup();
    mutateAsync.mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          errors: { IntervalHours: ["Interval is not currently allowed."] },
        },
      },
    });
    render(<ExerciseGenerationSettingsPage />);

    await replaceNumber(user, "Interval Hours", "12");
    await user.click(
      await screen.findByRole("button", { name: "Save settings" }),
    );

    expect(
      await screen.findByText("Interval is not currently allowed."),
    ).toBeInTheDocument();
  });

  it("preserves the selected enabled state when the update fails", async () => {
    const user = userEvent.setup();
    mutateAsync.mockRejectedValue(new Error("unavailable"));
    render(<ExerciseGenerationSettingsPage />);

    await openDisableConfirmation(user);
    await user.click(screen.getByRole("button", { name: "Disable" }));
    await user.click(screen.getByRole("button", { name: "Save settings" }));

    expect(
      await screen.findByText(/We couldn’t save these settings/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: "AI Exercise Generation" }),
    ).not.toBeChecked();
    expect(screen.getByText("Pending save")).toBeInTheDocument();
    expect(toastError).toHaveBeenCalled();
  });

  it("uses the authoritative update response after disabling", async () => {
    const user = userEvent.setup();
    const updated = { ...SETTINGS, enabled: false, version: "new-version" };
    mutateAsync.mockResolvedValue(updated);
    render(<ExerciseGenerationSettingsPage />);

    await openDisableConfirmation(user);
    await user.click(screen.getByRole("button", { name: "Disable" }));
    await user.click(screen.getByRole("button", { name: "Save settings" }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        enabled: false,
        initialDelayMinutes: 10,
        intervalHours: 24,
        minimumExerciseThreshold: 20,
        targetExerciseCount: 40,
        maxExercisesPerLessonPerRun: 50,
        version: SETTINGS.version,
      }),
    );
    expect(
      screen.getByRole("switch", { name: "AI Exercise Generation" }),
    ).not.toBeChecked();
    expect(screen.queryByText("Pending save")).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "Scheduled AI exercise generation is paused. Existing exercises remain available to learners.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save settings" }),
    ).toBeDisabled();
    expect(toastSuccess).toHaveBeenCalledWith(
      "Exercise generation settings updated.",
    );
  });

  it("shows access denied for a backend 403", () => {
    vi.mocked(useExerciseGenerationSettings).mockReturnValue({
      isPending: false,
      isError: true,
      isFetching: false,
      error: { isAxiosError: true, response: { status: 403 } },
      refetch,
    } as unknown as ReturnType<typeof useExerciseGenerationSettings>);

    render(<ExerciseGenerationSettingsPage />);

    expect(
      screen.getByRole("heading", { name: "Access denied" }),
    ).toBeInTheDocument();
  });

  it("resets edits to the last server values", async () => {
    const user = userEvent.setup();
    render(<ExerciseGenerationSettingsPage />);

    await replaceNumber(user, "Interval Hours", "12");
    await user.click(screen.getByRole("button", { name: "Reset changes" }));

    expect(screen.getByLabelText("Interval Hours")).toHaveValue(24);
    expect(
      screen.getByRole("button", { name: "Save settings" }),
    ).toBeDisabled();
  });

  it("blocks a concurrency overwrite and reloads the latest values", async () => {
    const user = userEvent.setup();
    const latest = { ...SETTINGS, intervalHours: 6, version: "latest-version" };
    mutateAsync.mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 409,
        data: { error: "exercise_generation.settings_concurrency_conflict" },
      },
    });
    refetch.mockResolvedValue({ data: latest });
    render(<ExerciseGenerationSettingsPage />);

    await replaceNumber(user, "Interval Hours", "12");
    await user.click(
      await screen.findByRole("button", { name: "Save settings" }),
    );

    expect(
      await screen.findByText(/changed by another administrator/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save settings" }),
    ).toBeDisabled();

    await user.click(
      screen.getByRole("button", { name: "Reload latest values" }),
    );
    expect(await screen.findByLabelText("Interval Hours")).toHaveValue(6);
  });
});

async function replaceNumber(
  user: ReturnType<typeof userEvent.setup>,
  label: string,
  value: string,
) {
  const input = screen.getByLabelText(label);
  await user.clear(input);
  await user.type(input, value);
}

function mockSettings(settings: ExerciseGenerationSettings) {
  vi.mocked(useExerciseGenerationSettings).mockReturnValue({
    data: settings,
    isPending: false,
    isError: false,
    isFetching: false,
    error: null,
    refetch,
  } as unknown as ReturnType<typeof useExerciseGenerationSettings>);
}

async function openDisableConfirmation(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.click(
    screen.getByRole("switch", { name: "AI Exercise Generation" }),
  );
  await screen.findByRole("heading", {
    name: "Disable AI Exercise Generation?",
  });
}
