import { beforeEach, describe, expect, it, vi } from "vitest";

const { get, put } = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn() }));

vi.mock("@/lib/axios", () => ({ axiosClient: { get, put } }));

import { systemSettingsService } from "./service";

describe("systemSettingsService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("gets SystemSettings from the SystemController endpoint", async () => {
    const response = { minimumLogLevel: "Information" };
    const controller = new AbortController();
    get.mockResolvedValue({ data: response });

    await expect(systemSettingsService.get(controller.signal)).resolves.toBe(
      response,
    );
    expect(get).toHaveBeenCalledWith("/api/system/settings", {
      signal: controller.signal,
    });
  });

  it("puts only the current SystemSettings contract", async () => {
    const request = { minimumLogLevel: "Debug" as const };
    const response = {
      ...request,
      updatedAtUtc: "2026-08-26T10:00:00Z",
      updatedByUserId: "admin-user",
    };
    put.mockResolvedValue({ data: response });

    await expect(systemSettingsService.update(request)).resolves.toBe(response);
    expect(put).toHaveBeenCalledWith("/api/system/settings", request);
  });
});
