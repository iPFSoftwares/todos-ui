export type Todo = {
  id: number;
  userId?: number;
  title: string;
  status: "in_progress" | "backlog" | "completed";
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: number;
  email: string;
  createdAt: string;
  updatedAt: string;
};
