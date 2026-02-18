import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TodosPage from "../pages/TodosPage";
import type { Todo } from "../types";

let todos: Todo[] = [];
let nextId = 1;

const listTodos = vi.fn(async () => todos);
const createTodo = vi.fn(async (title: string) => {
  const todo: Todo = {
    id: nextId++,
    title,
    status: "in_progress",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  };
  todos = [todo, ...todos];
  return todo;
});
const updateTodo = vi.fn(async (id: number, payload: Partial<Todo>) => {
  todos = todos.map((t) => (t.id === id ? { ...t, ...payload } : t));
  return todos.find((t) => t.id === id)!;
});
const deleteTodo = vi.fn(async (id: number) => {
  todos = todos.filter((t) => t.id !== id);
});

vi.mock("../api/todos", () => ({
  listTodos: () => listTodos(),
  createTodo: (title: string) => createTodo(title),
  updateTodo: (id: number, payload: Partial<Todo>) => updateTodo(id, payload),
  deleteTodo: (id: number) => deleteTodo(id)
}));

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return render(
    <QueryClientProvider client={client}>
      <TodosPage />
    </QueryClientProvider>
  );
}

describe("TodosPage", () => {
  beforeEach(() => {
    todos = [];
    nextId = 1;
    listTodos.mockReset();
    listTodos.mockImplementation(async () => todos);
    createTodo.mockClear();
    updateTodo.mockClear();
    deleteTodo.mockClear();
  });

  it("renders empty state and adds a todo", async () => {
    renderPage();

    expect(await screen.findByText(/Nothing here yet/i)).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Add a new todo/i);
    await userEvent.type(input, "Learn React Query");
    await userEvent.click(screen.getByRole("button", { name: /Add/i }));

    expect(await screen.findByText("Learn React Query")).toBeInTheDocument();
    expect(createTodo).toHaveBeenCalledWith("Learn React Query");
  });

  it("toggles and deletes", async () => {
    todos = [
      {
        id: 1,
        title: "Ship tests",
        status: "in_progress",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z"
      }
    ];

    renderPage();

    expect(await screen.findByText("Ship tests")).toBeInTheDocument();

    const checkbox = screen.getByRole("button", { name: /Mark as completed/i });
    await userEvent.click(checkbox);
    expect(updateTodo).toHaveBeenCalledWith(1, { status: "completed" });

    const deleteButton = screen.getByRole("button", { name: /Delete/i });
    await userEvent.click(deleteButton);
    expect(deleteTodo).toHaveBeenCalledWith(1);
  });

  it("filters active and done todos", async () => {
    todos = [
      {
        id: 1,
        title: "Active item",
        status: "in_progress",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z"
      },
      {
        id: 2,
        title: "Done item",
        status: "completed",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z"
      },
      {
        id: 3,
        title: "Backlog item",
        status: "backlog",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z"
      }
    ];

    renderPage();

    expect(await screen.findByText("Active item")).toBeInTheDocument();
    expect(screen.queryByText("Done item")).not.toBeInTheDocument();
    expect(screen.queryByText("Backlog item")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /^In Progress$/i }));
    expect(screen.getByText("Active item")).toBeInTheDocument();
    expect(screen.queryByText("Done item")).not.toBeInTheDocument();
    expect(screen.queryByText("Backlog item")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /^Completed$/i }));
    expect(screen.queryByText("Active item")).not.toBeInTheDocument();
    expect(screen.getByText("Done item")).toBeInTheDocument();
    expect(screen.queryByText("Backlog item")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /^Backlog$/i }));
    expect(screen.queryByText("Active item")).not.toBeInTheDocument();
    expect(screen.queryByText("Done item")).not.toBeInTheDocument();
    expect(screen.getByText("Backlog item")).toBeInTheDocument();
  });

  it("shows error state on failed load", async () => {
    listTodos.mockRejectedValueOnce(new Error("Load failed"));
    renderPage();
    expect(await screen.findByText(/Load failed/i)).toBeInTheDocument();
  });
});
