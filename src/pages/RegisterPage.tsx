import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/auth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const registerMutation = useMutation({
    mutationFn: () => register(email.trim(), password),
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
    registerMutation.mutate();
  }

  return (
    <section className="panel auth-panel">
      <div className="panel-header">
        <div>
          <h1>Create your account</h1>
          <p>Start tracking your own private todos.</p>
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
            placeholder="Create a password"
            autoComplete="new-password"
          />
        </label>
        {registerMutation.isError && (
          <div className="form-error">{String(registerMutation.error)}</div>
        )}
        <button type="submit" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? "Creating..." : "Create account"}
        </button>
      </form>
      <div className="form-footer">
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </section>
  );
}
