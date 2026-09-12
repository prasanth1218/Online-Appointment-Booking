import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiClient, registerSessionExpiredHandler, setAccessToken } from "../lib/apiClient.js";
import { queryClient } from "../lib/queryClient.js";
import type { ApiSuccess, User } from "../types/index.js";

interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    registerSessionExpiredHandler(() => {
      setUser(null);
      setAccessToken(null);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const refreshRes = await apiClient.post<ApiSuccess<{ user: User; accessToken: string }>>("/auth/refresh");
        if (cancelled) return;
        setAccessToken(refreshRes.data.data.accessToken);
        setUser(refreshRes.data.data.user);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const res = await apiClient.post<ApiSuccess<{ user: User; accessToken: string }>>("/auth/login", input);
    setAccessToken(res.data.data.accessToken);
    setUser(res.data.data.user);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const res = await apiClient.post<ApiSuccess<{ user: User; accessToken: string }>>("/auth/register", input);
    setAccessToken(res.data.data.accessToken);
    setUser(res.data.data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      setAccessToken(null);
      setUser(null);
      queryClient.clear();
    }
  }, []);

  const updateUser = useCallback((updated: User) => setUser(updated), []);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, updateUser }),
    [user, isLoading, login, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider.");
  return ctx;
}
