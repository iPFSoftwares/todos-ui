import { afterEach, describe, expect, it, vi } from "vitest";
import { createTodo, deleteTodo, listTodos, updateTodo } from "../api/todos";

const mockFetch = vi.fn();

afterEach(() => {
  mockFetch.mockReset();
});

declare global {
  // eslint-disable-next-line no-var
  var fetch: typeof mockFetch;
}

globalThis.fetch = mockFetch as unknown as typeof fetch;

describe("todos api client", () => {
  it("lists todos", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve([{ id: 1, title: "Test", status: "in_progress" }])
    });

    const data = await listTodos();
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/todos",
      expect.objectContaining({
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      })
    );
    expect(data[0].title).toBe("Test");
  });

  it("creates, updates, and deletes", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () =>
          Promise.resolve({ id: 1, title: "New", status: "in_progress" })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({ id: 1, title: "New", status: "completed" })
      })
      .mockResolvedValueOnce({ ok: true, status: 204, text: () => Promise.resolve("") });

    const created = await createTodo("New");
    expect(created.id).toBe(1);

    const updated = await updateTodo(1, { status: "completed" });
    expect(updated.status).toBe("completed");

    await deleteTodo(1);
    expect(mockFetch).toHaveBeenCalledTimes(3);

    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      "http://localhost:8080/api/v1/todos",
      expect.objectContaining({ method: "POST", credentials: "include" })
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8080/api/v1/todos/1",
      expect.objectContaining({ method: "PATCH", credentials: "include" })
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      3,
      "http://localhost:8080/api/v1/todos/1",
      expect.objectContaining({ method: "DELETE", credentials: "include" })
    );
  });
});
