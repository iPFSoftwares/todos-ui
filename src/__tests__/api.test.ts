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
      json: () => Promise.resolve([{ id: 1, title: "Test", completed: false }])
    });

    const data = await listTodos();
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/todos",
      expect.objectContaining({ headers: { "Content-Type": "application/json" } })
    );
    expect(data[0].title).toBe("Test");
  });

  it("creates, updates, and deletes", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ id: 1, title: "New", completed: false })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 1, title: "New", completed: true })
      })
      .mockResolvedValueOnce({ ok: true, status: 204, text: () => Promise.resolve("") });

    const created = await createTodo("New");
    expect(created.id).toBe(1);

    const updated = await updateTodo(1, { completed: true });
    expect(updated.completed).toBe(true);

    await deleteTodo(1);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });
});
