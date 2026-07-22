"use client";

import { registerAuthCallback } from "@/lib/authFetch";
import { AuthUser } from "@/lib/types";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuth: (user: AuthUser, accessToken: string) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setAuth = useCallback((newUser: AuthUser, newAccessToken: string) => {
    setUser(newUser);
    setAccessToken(newAccessToken);
    setIsLoading(false);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    registerAuthCallback(
      (token, incomingUser) => setAuth(incomingUser, token),
      clearAuth,
    );
  }, [setAuth, clearAuth]);

  useEffect(() => {
    async function checkSession() {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        clearAuth();
        return;
      }

      const json = await res.json();
      setAuth(json.data.user, json.data.accessToken);
    }

    checkSession();
  }, [clearAuth, setAuth]);

  return (
    <AuthContext.Provider
      value={{ user, accessToken, isLoading, setAuth, clearAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
