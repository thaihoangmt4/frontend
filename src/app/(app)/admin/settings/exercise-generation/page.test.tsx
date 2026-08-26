import { describe, expect, it, vi } from "vitest";
import { redirect } from "next/navigation";
import ExerciseGenerationSettingsRoute from "./page";

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

describe("legacy exercise generation settings route", () => {
  it("redirects bookmarks to the general settings page", () => {
    ExerciseGenerationSettingsRoute();

    expect(redirect).toHaveBeenCalledWith("/admin/settings");
  });
});
