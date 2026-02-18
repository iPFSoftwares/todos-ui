import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import App from "../App";
import type { User } from "../types";

const me = vi.fn();
const logout = vi.fn();

vi.mock("../api/auth", () => ({
  me: () => me(),
  logout: () => logout()
}));

function renderApp(initialEntry: string) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  const router = createMemoryRouter(
    [
      {
        element: <App />,
        children: [
          { path: "/todos", element: <div>todos page</div> },
          { path: "/login", element: <div>login page</div> }
        ]
      }
    ],
    { initialEntries: [initialEntry] }
  );

  return render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

describe("App header", () => {
  afterEach(() => {
    me.mockReset();
    logout.mockReset();
  });

  it("shows user and logs out", async () => {
    me.mockResolvedValueOnce({ id: 1, email: "user@example.com" } as User);
    logout.mockResolvedValueOnce(undefined);

    renderApp("/todos");

    expect(await screen.findByText("user@example.com")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Sign out/i }));

    expect(logout).toHaveBeenCalled();
    expect(await screen.findByText("login page")).toBeInTheDocument();
  });

  it("redirects to login when logout returns 401", async () => {
    me.mockResolvedValueOnce({ id: 1, email: "user@example.com" } as User);
    const error = Object.assign(new Error("Unauthorized"), { status: 401 });
    logout.mockRejectedValueOnce(error);

    renderApp("/todos");

    expect(await screen.findByText("user@example.com")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Sign out/i }));

    expect(await screen.findByText("login page")).toBeInTheDocument();
  });

  it("shows login/register when unauthenticated", async () => {
    me.mockRejectedValueOnce(new Error("Unauthorized"));
    renderApp("/todos");

    expect(await screen.findByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Register")).toBeInTheDocument();
  });
});
