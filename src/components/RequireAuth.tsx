import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { me } from "../api/auth";
import { ApiError } from "../api/client";

type Props = {
  children: ReactNode;
};

export default function RequireAuth({ children }: Props) {
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: me,
    retry: false
  });

  if (meQuery.isLoading) {
    return <div className="panel">Checking session...</div>;
  }

  if (meQuery.isError) {
    const status = (meQuery.error as ApiError).status;
    if (status === 401) {
      return <Navigate to="/login" replace />;
    }
    return <div className="empty error">{String(meQuery.error)}</div>;
  }

  return <>{children}</>;
}
