import { afterEach, describe, expect, it, vi } from "vitest";
import { request, ApiError } from "../api/client";

const mockFetch = vi.fn();

afterEach(() => {
  mockFetch.mockReset();
});

declare global {
  // eslint-disable-next-line no-var
  var fetch: typeof mockFetch;
}

globalThis.fetch = mockFetch as unknown as typeof fetch;

describe("api client", () => {
  it("returns undefined for 204", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 204,
      json: () => Promise.resolve(undefined)
    });

    const res = await request<void>("/api/v1/auth/logout", { method: "POST" });
    expect(res).toBeUndefined();
  });

  it("throws ApiError for non-ok responses", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve("Unauthorized")
    });

    await expect(request("/api/v1/auth/me")).rejects.toBeInstanceOf(ApiError);
  });
});
