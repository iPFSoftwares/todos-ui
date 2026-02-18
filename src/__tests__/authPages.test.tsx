import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import type { User } from "../types";

const login = vi.fn();
const register = vi.fn();

vi.mock("../api/auth", () => ({
  login: (...args: unknown[]) => login(...args),
  register: (...args: unknown[]) => register(...args)
}));

function renderWithRouter(initialEntry: string, routes: any[]) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  const router = createMemoryRouter(routes, { initialEntries: [initialEntry] });
  return render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

describe("auth pages", () => {
  afterEach(() => {
    login.mockReset();
    register.mockReset();
  });

  it("logs in and redirects to todos", async () => {
    login.mockResolvedValueOnce({ id: 1, email: "user@example.com" } as User);

    renderWithRouter("/login", [
      { path: "/login", element: <LoginPage /> },
      { path: "/todos", element: <div>todos page</div> }
    ]);

    await userEvent.type(screen.getByLabelText(/Email/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/Password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /Sign in/i }));

    expect(await screen.findByText("todos page")).toBeInTheDocument();
    expect(login).toHaveBeenCalledWith("user@example.com", "password123");
  });

  it("does not submit login with empty fields", async () => {
    renderWithRouter("/login", [
      { path: "/login", element: <LoginPage /> },
      { path: "/todos", element: <div>todos page</div> }
    ]);

    await userEvent.click(screen.getByRole("button", { name: /Sign in/i }));
    expect(login).not.toHaveBeenCalled();
  });

  it("registers and redirects to todos", async () => {
    register.mockResolvedValueOnce({ id: 2, email: "new@example.com" } as User);

    renderWithRouter("/register", [
      { path: "/register", element: <RegisterPage /> },
      { path: "/todos", element: <div>todos page</div> }
    ]);

    await userEvent.type(screen.getByLabelText(/Email/i), "new@example.com");
    await userEvent.type(screen.getByLabelText(/Password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /Create account/i }));

    expect(await screen.findByText("todos page")).toBeInTheDocument();
    expect(register).toHaveBeenCalledWith("new@example.com", "password123");
  });

  it("does not submit register with empty fields", async () => {
    renderWithRouter("/register", [
      { path: "/register", element: <RegisterPage /> },
      { path: "/todos", element: <div>todos page</div> }
    ]);

    await userEvent.click(screen.getByRole("button", { name: /Create account/i }));
    expect(register).not.toHaveBeenCalled();
  });
});
