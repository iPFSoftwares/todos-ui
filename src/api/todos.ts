import type { Todo } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json"
    },
    ...init
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export function listTodos() {
  return request<Todo[]>("/api/todos");
}

export function createTodo(title: string) {
  return request<Todo>("/api/todos", {
    method: "POST",
    body: JSON.stringify({ title })
  });
}

export function updateTodo(
  id: number,
  payload: Partial<Pick<Todo, "title" | "completed">>
) {
  return request<Todo>(`/api/todos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteTodo(id: number) {
  return request<void>(`/api/todos/${id}`, {
    method: "DELETE"
  });
}
