import { refreshAccessToken } from "../services/authService";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000";

let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string | null) => void) {
  refreshSubscribers.push(cb);
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit & { _isRetry?: boolean } = {}
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
    let isExpiredToken = false;

    try {
      const errData = await response.json();
      if (errData && errData.message) {
        errorMsg = errData.message;
        const msg = errData.message.toLowerCase();
        if (
          response.status === 401 &&
          (msg.includes("jwt expired") || msg.includes("token expired"))
        ) {
          isExpiredToken = true;
        }
      }
    } catch (_) {}

    // If backend returns JWT expired error and we haven't retried yet:
    if (isExpiredToken && !options._isRetry) {
      if (!isRefreshing) {
        isRefreshing = true;
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        onRefreshed(newToken);

        if (newToken) {
          // Retry the request ONCE with the new access token
          headers.set("Authorization", `Bearer ${newToken}`);
          return apiRequest<T>(endpoint, {
            ...options,
            headers,
            _isRetry: true,
          });
        } else {
          // Refresh failed - force user logout and redirect to login
          localStorage.removeItem("agrisense_token");
          localStorage.removeItem("agrisense_session");
          if (typeof window !== "undefined" && window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
          throw new Error("Session expired. Please sign in again.");
        }
      } else {
        // Wait for the active refresh request to finish
        return new Promise<T>((resolve, reject) => {
          addRefreshSubscriber((newToken) => {
            if (newToken) {
              headers.set("Authorization", `Bearer ${newToken}`);
              apiRequest<T>(endpoint, {
                ...options,
                headers,
                _isRetry: true,
              })
                .then(resolve)
                .catch(reject);
            } else {
              reject(new Error("Session expired. Please sign in again."));
            }
          });
        });
      }
    }

    throw new Error(errorMsg);
  }

  return response.json() as Promise<T>;
}
