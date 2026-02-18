import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { logout, me } from "./api/auth";
import { ApiError } from "./api/client";

export default function App() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: me,
    retry: false
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["me"], null);
      navigate("/login", { replace: true });
    },
    onError: (error) => {
      const status = (error as ApiError).status;
      if (status === 401) {
        queryClient.setQueryData(["me"], null);
        navigate("/login", { replace: true });
      }
    }
  });

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="logo">✓</div>
          <div>
            <div className="title">Todos</div>
            <div className="subtitle">Plan, focus, and ship daily</div>
          </div>
        </div>
        <nav className="nav">
          {meQuery.data ? (
            <div className="nav-auth">
              <span className="nav-user">{meQuery.data.email}</span>
              <button
                type="button"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Signing out..." : "Sign out"}
              </button>
            </div>
          ) : (
            <div className="nav-auth">
              <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
                Login
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => (isActive ? "active" : "")}>
                Register
              </NavLink>
            </div>
          )}
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
