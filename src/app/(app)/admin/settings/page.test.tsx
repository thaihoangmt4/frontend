import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminSettingsRoute from "./page";

vi.mock("@/components/auth", () => ({
  AdminRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="admin-route">{children}</div>
  ),
}));
vi.mock("@/features/admin-settings", () => ({
  AdminSettingsPage: () => <h1>Settings</h1>,
}));

describe("/admin/settings", () => {
  it("renders the settings page inside the Admin authorization boundary", () => {
    render(<AdminSettingsRoute />);

    expect(screen.getByTestId("admin-route")).toContainElement(
      screen.getByRole("heading", { name: "Settings" }),
    );
  });
});
