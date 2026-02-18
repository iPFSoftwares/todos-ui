import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: () => login(email.trim(), password),
    onSuccess: (user) => {
      queryClient.setQueryData(["me"], user);
      navigate("/todos", { replace: true });
    }
  });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password) {
      return;
    }
    loginMutation.mutate();
  }

  return (
    <section className="panel auth-panel">
      <div className="panel-header">
        <div>
          <h1>Welcome back</h1>
          <p>Sign in to continue with your todos.</p>
        </div>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your password"
            autoComplete="current-password"
          />
        </label>
        {loginMutation.isError && (
          <div className="form-error">{String(loginMutation.error)}</div>
        )}
        <button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <div className="form-footer">
        New here? <Link to="/register">Create an account</Link>
      </div>
    </section>
  );
}
