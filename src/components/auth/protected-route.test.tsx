import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { ProtectedRoute } from "./protected-route";

const { replace, authState } = vi.hoisted(() => ({
  replace: vi.fn(),
  authState: { isAuthenticated: false, isLoading: false },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/learn/lessons/lesson-1",
}));
vi.mock("@/stores/auth.store", () => ({ useAuthStore: () => authState }));

describe("ProtectedRoute", () => {
  it("redirects unauthenticated learning routes using the current convention", async () => {
    render(<ProtectedRoute><div>Protected content</div></ProtectedRoute>);
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(
        "/login?redirect=%2Flearn%2Flessons%2Flesson-1",
      ),
    );
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });
});
