import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Breadcrumb } from "./breadcrumb";
import { Sidebar } from "./sidebar";

let pathname = "/admin/settings";

vi.mock("next/navigation", () => ({ usePathname: () => pathname }));
vi.mock("@/stores/auth.store", () => ({
  useAuthStore: (selector: (state: { accessToken: string }) => unknown) =>
    selector({ accessToken: "admin-token" }),
}));
vi.mock("@/utils/jwt", () => ({
  getUserFromToken: () => ({ role: "Admin" }),
}));

describe("admin settings navigation", () => {
  beforeEach(() => {
    pathname = "/admin/settings";
  });

  it("links the renamed Settings navigation item to the general route", () => {
    render(<Sidebar open onClose={vi.fn()} />);

    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "href",
      "/admin/settings",
    );
    expect(screen.queryByText("Generation Settings")).not.toBeInTheDocument();
  });

  it("renders the Admin > Settings breadcrumb", () => {
    render(<Breadcrumb />);

    expect(screen.getByRole("link", { name: "Admin" })).toHaveAttribute(
      "href",
      "/admin",
    );
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });
});
