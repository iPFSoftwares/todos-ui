import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTodo, deleteTodo, listTodos, updateTodo } from "../api/todos";
import type { Todo } from "../types";

export default function TodosPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

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

  const toggleMutation = useMutation({
    mutationFn: (todo: Todo) => updateTodo(todo.id, { completed: !todo.completed }),
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
    if (filter === "active") {
      return list.filter((todo) => !todo.completed);
    }
    if (filter === "done") {
      return list.filter((todo) => todo.completed);
    }
    return list;
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
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            type="button"
            className={filter === "active" ? "active" : ""}
            onClick={() => setFilter("active")}
          >
            Active
          </button>
          <button
            type="button"
            className={filter === "done" ? "active" : ""}
            onClick={() => setFilter("done")}
          >
            Done
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
          <li key={todo.id} className={todo.completed ? "done" : ""}>
            <button
              type="button"
              className="toggle"
              onClick={() => toggleMutation.mutate(todo)}
              aria-label={todo.completed ? "Mark as active" : "Mark as done"}
            >
              {todo.completed ? "✓" : "○"}
            </button>
            <div className="todo-content">
              <div className="todo-title">{todo.title}</div>
              <div className="todo-meta">
                Created {new Date(todo.createdAt).toLocaleString()}
              </div>
            </div>
            <button
              type="button"
              className="delete"
              onClick={() => deleteMutation.mutate(todo.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
