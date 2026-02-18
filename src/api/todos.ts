import type { Todo } from "../types";
import { request } from "./client";

export function listTodos() {
  return request<Todo[]>("/api/v1/todos");
}

export function createTodo(title: string) {
  return request<Todo>("/api/v1/todos", {
    method: "POST",
    body: JSON.stringify({ title })
  });
}

export function updateTodo(
  id: number,
  payload: Partial<Pick<Todo, "title" | "status">>
) {
  return request<Todo>(`/api/v1/todos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteTodo(id: number) {
  return request<void>(`/api/v1/todos/${id}`, {
    method: "DELETE"
  });
}
