import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiErrorBody } from "../types/index.js";

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let accessToken: string | null = null;
let onSessionExpired: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

/** Registered once by AuthProvider so the client can clear auth state after a failed refresh. */
export function registerSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  withCredentials: true,
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post<{ success: true; data: { accessToken: string } }>("/auth/refresh")
      .then((res) => {
        const token = res.data.data.accessToken;
        setAccessToken(token);
        return token;
      })
      .catch(() => {
        setAccessToken(null);
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    // These must never trigger the refresh-and-retry flow below: retrying a failed
    // refresh call by calling refresh again would await the very promise it's
    // nested inside (a deadlock), and login/register failures are just bad
    // credentials, not an expired session.
    const isExemptFromRetry = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"].some((path) =>
      originalRequest?.url?.includes(path),
    );

    if (error.response?.status === 401 && originalRequest && !originalRequest._retried && !isExemptFromRetry) {
      originalRequest._retried = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
        return apiClient(originalRequest);
      }
      onSessionExpired?.();
    }

    if (error.response?.data?.error) {
      const { code, message, details } = error.response.data.error;
      return Promise.reject(new ApiError(error.response.status, code, message, details));
    }

    if (error.code === "ECONNABORTED" || !error.response) {
      return Promise.reject(
        new ApiError(0, "NETWORK_ERROR", "Could not reach the server. Check your connection and try again."),
      );
    }

    return Promise.reject(new ApiError(error.response.status, "UNKNOWN_ERROR", "Something went wrong. Please try again."));
  },
);

export { refreshAccessToken };
