import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import RequireAuth from "../components/RequireAuth";
import RedirectIfAuth from "../components/RedirectIfAuth";
import { ApiError } from "../api/client";
import type { User } from "../types";

const me = vi.fn();
vi.mock("../api/auth", () => ({
  me: () => me()
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

describe("auth guards", () => {
  afterEach(() => {
    me.mockReset();
  });
  it("RequireAuth renders children when authenticated", async () => {
    me.mockResolvedValueOnce({ id: 1, email: "user@example.com" } as User);

    renderWithRouter("/protected", [
      {
        path: "/protected",
        element: (
          <RequireAuth>
            <div>secret</div>
          </RequireAuth>
        )
      },
      { path: "/login", element: <div>login</div> }
    ]);

    expect(await screen.findByText("secret")).toBeInTheDocument();
  });

  it("RequireAuth redirects to login when unauthorized", async () => {
    me.mockRejectedValueOnce(new ApiError("Unauthorized", 401));

    renderWithRouter("/protected", [
      {
        path: "/protected",
        element: (
          <RequireAuth>
            <div>secret</div>
          </RequireAuth>
        )
      },
      { path: "/login", element: <div>login</div> }
    ]);

    expect(await screen.findByText("login")).toBeInTheDocument();
  });

  it("RequireAuth shows error for non-401 failures", async () => {
    me.mockRejectedValueOnce(new Error("Boom"));

    renderWithRouter("/protected", [
      {
        path: "/protected",
        element: (
          <RequireAuth>
            <div>secret</div>
          </RequireAuth>
        )
      },
      { path: "/login", element: <div>login</div> }
    ]);

    expect(await screen.findByText(/Boom/)).toBeInTheDocument();
  });

  it("RedirectIfAuth shows children when unauthenticated", async () => {
    me.mockRejectedValueOnce(new ApiError("Unauthorized", 401));

    renderWithRouter("/login", [
      {
        path: "/login",
        element: (
          <RedirectIfAuth>
            <div>login page</div>
          </RedirectIfAuth>
        )
      },
      { path: "/todos", element: <div>todos</div> }
    ]);

    expect(await screen.findByText("login page")).toBeInTheDocument();
  });

  it("RedirectIfAuth redirects to todos when authenticated", async () => {
    me.mockResolvedValueOnce({ id: 1, email: "user@example.com" } as User);

    renderWithRouter("/login", [
      {
        path: "/login",
        element: (
          <RedirectIfAuth>
            <div>login page</div>
          </RedirectIfAuth>
        )
      },
      { path: "/todos", element: <div>todos</div> }
    ]);

    expect(await screen.findByText("todos")).toBeInTheDocument();
  });

  it("RedirectIfAuth shows error for non-401 failures", async () => {
    me.mockRejectedValueOnce(new Error("Boom"));

    renderWithRouter("/login", [
      {
        path: "/login",
        element: (
          <RedirectIfAuth>
            <div>login page</div>
          </RedirectIfAuth>
        )
      },
      { path: "/todos", element: <div>todos</div> }
    ]);

    expect(await screen.findByText(/Boom/)).toBeInTheDocument();
  });
});
