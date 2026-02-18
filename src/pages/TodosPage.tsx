import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTodo, deleteTodo, listTodos, updateTodo } from "../api/todos";
import type { Todo } from "../types";

export default function TodosPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<"in_progress" | "backlog" | "completed">(
    "in_progress"
  );

  const todosQuery = useQuery({
    queryKey: ["todos"],
    queryFn: listTodos
  });

  const createMutation = useMutation({
    mutationFn: (newTitle: string) => createTodo(newTitle),
    onSuccess: () => {
      setTitle("");
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    }
  });

  const statusMutation = useMutation({
    mutationFn: (payload: { id: number; status: Todo["status"] }) =>
      updateTodo(payload.id, { status: payload.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    }
  });

  const filtered = useMemo(() => {
    const list = todosQuery.data || [];
    return list.filter((todo) => todo.status === filter);
  }, [filter, todosQuery.data]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }
    createMutation.mutate(title.trim());
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h1>Today&apos;s Todos</h1>
          <p>Track what matters, keep the list small, finish strong.</p>
        </div>
        <div className="filters">
          <button
            type="button"
            className={filter === "backlog" ? "active" : ""}
            onClick={() => setFilter("backlog")}
          >
            Backlog
          </button>
          <button
            type="button"
            className={filter === "in_progress" ? "active" : ""}
            onClick={() => setFilter("in_progress")}
          >
            In Progress
          </button>
          <button
            type="button"
            className={filter === "completed" ? "active" : ""}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
        </div>
      </div>

      <form className="todo-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a new todo"
        />
        <button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Adding..." : "Add"}
        </button>
      </form>

      <div className="todo-list-wrap">
        {todosQuery.isLoading && <div className="empty">Loading todos...</div>}
        {todosQuery.isError && (
          <div className="empty error">
            {String(todosQuery.error)}
          </div>
        )}

        {!todosQuery.isLoading && filtered.length === 0 && (
          <div className="empty">Nothing here yet. Add a todo above.</div>
        )}

        <ul className="todo-list">
          {filtered.map((todo) => (
            <li key={todo.id} className={todo.status === "completed" ? "done" : ""}>
              <button
                type="button"
                className={`status-box ${todo.status}`}
                onClick={() => {
                  if (todo.status === "in_progress") {
                    statusMutation.mutate({ id: todo.id, status: "completed" });
                  }
                }}
                aria-label={
                  todo.status === "in_progress"
                    ? "Mark as completed"
                    : todo.status === "completed"
                    ? "Completed"
                    : "Backlog item"
                }
                disabled={todo.status !== "in_progress"}
              >
                {todo.status === "completed" ? "✓" : ""}
              </button>
              <div className="todo-content">
                <div className="todo-title">{todo.title}</div>
                <div className="todo-status">
                  {todo.status === "in_progress"
                    ? "In Progress"
                    : todo.status === "backlog"
                    ? "Backlog"
                    : "Completed"}
                </div>
                <div className="todo-meta">
                  Created {new Date(todo.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="todo-actions">
                {todo.status === "in_progress" && (
                  <button
                    type="button"
                    aria-label="Move to backlog"
                    onClick={() => statusMutation.mutate({ id: todo.id, status: "backlog" })}
                  >
                    ↩
                  </button>
                )}
                {todo.status === "backlog" && (
                  <button
                    type="button"
                    aria-label="Activate task"
                    onClick={() => statusMutation.mutate({ id: todo.id, status: "in_progress" })}
                  >
                    ▶
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Delete"
                  onClick={() => deleteMutation.mutate(todo.id)}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
