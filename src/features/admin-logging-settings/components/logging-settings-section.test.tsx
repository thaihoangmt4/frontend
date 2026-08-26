import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSystemSettings, useUpdateSystemSettings } from "../hooks";
import type { SystemSettings } from "../types";
import { SystemSettingsSection } from "./logging-settings-section";

vi.mock("../hooks", () => ({
  useSystemSettings: vi.fn(),
  useUpdateSystemSettings: vi.fn(),
}));

const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({ success: toastSuccess, error: toastError }),
}));

const SETTINGS: SystemSettings = {
  minimumLogLevel: "Information",
  updatedAtUtc: "2026-08-26T08:00:00Z",
  updatedByUserId: "admin-user",
};

const refetch = vi.fn();
const mutateAsync = vi.fn();

describe("SystemSettingsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSystemSettings).mockReturnValue({
      data: SETTINGS,
      isPending: false,
      isError: false,
      isFetching: false,
      error: null,
      refetch,
    } as unknown as ReturnType<typeof useSystemSettings>);
    vi.mocked(useUpdateSystemSettings).mockReturnValue({
      isPending: false,
      mutateAsync,
    } as unknown as ReturnType<typeof useUpdateSystemSettings>);
  });

  it("loads the persisted logging level and metadata", () => {
    render(<SystemSettingsSection />);

    expect(screen.getByText("Current level: Information")).toBeInTheDocument();
    expect(screen.getByText("Updated by: admin-user")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save logging level" }),
    ).toBeDisabled();
  });

  it("offers exactly the backend-supported levels", async () => {
    const user = userEvent.setup();
    render(<SystemSettingsSection />);

    await user.click(
      screen.getByRole("combobox", { name: "Minimum Log Level" }),
    );

    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toEqual(["Debug", "Information", "Warning", "Error", "Fatal"]);
  });

  it("enables save and warns without claiming Debug is current", async () => {
    const user = userEvent.setup();
    render(<SystemSettingsSection />);

    await selectLevel(user, "Debug");

    expect(
      screen.getByText(
        /Debug logging generates additional diagnostic data and may increase log volume/,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Current level: Information")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save logging level" }),
    ).toBeEnabled();
  });

  it("saves only the selected level and uses the authoritative response", async () => {
    const user = userEvent.setup();
    const updated = { ...SETTINGS, minimumLogLevel: "Debug" as const };
    mutateAsync.mockResolvedValue(updated);
    const view = render(<SystemSettingsSection />);

    await selectLevel(user, "Debug");
    await user.click(
      screen.getByRole("button", { name: "Save logging level" }),
    );

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({ minimumLogLevel: "Debug" }),
    );
    vi.mocked(useSystemSettings).mockReturnValue({
      data: updated,
      isPending: false,
      isError: false,
      isFetching: false,
      error: null,
      refetch,
    } as unknown as ReturnType<typeof useSystemSettings>);
    view.rerender(<SystemSettingsSection />);

    expect(screen.getByText("Current level: Debug")).toBeInTheDocument();
    expect(toastSuccess).toHaveBeenCalledWith(
      "Logging level updated to Debug.",
    );
  });

  it("preserves the selection and reports a backend error", async () => {
    const user = userEvent.setup();
    mutateAsync.mockRejectedValue(new Error("unavailable"));
    render(<SystemSettingsSection />);

    await selectLevel(user, "Warning");
    await user.click(
      screen.getByRole("button", { name: "Save logging level" }),
    );

    expect(
      await screen.findByText(/We couldn’t update the logging level/),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveTextContent("Warning");
    expect(toastError).toHaveBeenCalled();
  });

  it("resets an unsaved selection to the persisted level", async () => {
    const user = userEvent.setup();
    render(<SystemSettingsSection />);

    await selectLevel(user, "Error");
    await user.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByRole("combobox")).toHaveTextContent("Information");
    expect(
      screen.getByRole("button", { name: "Save logging level" }),
    ).toBeDisabled();
  });

  it("uses the existing access-denied convention for a backend 403", () => {
    vi.mocked(useSystemSettings).mockReturnValue({
      isPending: false,
      isError: true,
      isFetching: false,
      error: { isAxiosError: true, response: { status: 403 } },
      refetch,
    } as unknown as ReturnType<typeof useSystemSettings>);

    render(<SystemSettingsSection />);

    expect(
      screen.getByRole("heading", { name: "Access denied" }),
    ).toBeInTheDocument();
  });
});

async function selectLevel(
  user: ReturnType<typeof userEvent.setup>,
  level: string,
) {
  await user.click(screen.getByRole("combobox", { name: "Minimum Log Level" }));
  await user.click(screen.getByRole("option", { name: level }));
}
