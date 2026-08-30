/**
 * api.ts — Centralized backend API request wrapper for AgriSense.
 * Automatically attaches the JWT bearer token from localStorage if present.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000";

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("agrisense_token");

  const headers = new Headers(options.headers);

  // Auto-attach JWT token
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Set default JSON Content-Type (except for FormData uploads)
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errData = await response.json();
      if (errData && errData.message) {
        errorMsg = errData.message;
      }
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return response.json() as Promise<T>;
}
