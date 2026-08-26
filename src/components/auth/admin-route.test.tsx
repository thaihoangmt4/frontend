import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminRoute } from "./admin-route";

let accessToken: string | null = null;

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: (
    selector: (state: { accessToken: string | null }) => unknown,
  ) => selector({ accessToken }),
}));
vi.mock("@/utils/jwt", () => ({
  getUserFromToken: () => ({ role: "Admin" }),
}));

describe("AdminRoute", () => {
  it("denies a user without an Admin token", () => {
    accessToken = null;
    render(
      <AdminRoute>
        <div>Private settings</div>
      </AdminRoute>,
    );

    expect(
      screen.getByRole("heading", { name: "Access denied" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Private settings")).not.toBeInTheDocument();
  });

  it("renders settings for an Admin", () => {
    accessToken = "admin-token";
    render(
      <AdminRoute>
        <div>Private settings</div>
      </AdminRoute>,
    );

    expect(screen.getByText("Private settings")).toBeInTheDocument();
  });
});
