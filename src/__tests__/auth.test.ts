import { afterEach, describe, expect, it, vi } from "vitest";
import { login, logout, me, register } from "../api/auth";

const mockFetch = vi.fn();

afterEach(() => {
  mockFetch.mockReset();
});

declare global {
  // eslint-disable-next-line no-var
  var fetch: typeof mockFetch;
}

globalThis.fetch = mockFetch as unknown as typeof fetch;

describe("auth api client", () => {
  it("logs in", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: 1, email: "user@example.com" })
    });

    const data = await login("user@example.com", "secret");
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/auth/login",
      expect.objectContaining({
        method: "POST",
        credentials: "include"
      })
    );
    expect(data.email).toBe("user@example.com");
  });

  it("registers", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ id: 2, email: "new@example.com" })
    });

    const data = await register("new@example.com", "secret");
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/auth/register",
      expect.objectContaining({
        method: "POST",
        credentials: "include"
      })
    );
    expect(data.email).toBe("new@example.com");
  });

  it("logs out", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 204,
      text: () => Promise.resolve("")
    });

    await logout();
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/auth/logout",
      expect.objectContaining({
        method: "POST",
        credentials: "include"
      })
    );
  });

  it("loads current user", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: 1, email: "me@example.com" })
    });

    const data = await me();
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/auth/me",
      expect.objectContaining({
        credentials: "include"
      })
    );
    expect(data.email).toBe("me@example.com");
  });
});
