import type { User } from "../types";
import { request } from "./client";

export function register(email: string, password: string) {
  return request<User>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function login(email: string, password: string) {
  return request<User>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function logout() {
  return request<void>("/api/v1/auth/logout", {
    method: "POST"
  });
}

export function me() {
  return request<User>("/api/v1/auth/me");
}
