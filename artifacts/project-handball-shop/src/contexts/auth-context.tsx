import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type PlayerRank = "unranked" | "c" | "b" | "a" | "s";

export type AuthPlayer = {
  id: number;
  name: string;
  email: string;
  rank: string;
};

type AuthContextValue = {
  player: AuthPlayer | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "ph_token";
const PLAYER_KEY = "ph_player";

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<AuthPlayer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedPlayer = localStorage.getItem(PLAYER_KEY);
    if (savedToken && savedPlayer) {
      try {
        setToken(savedToken);
        setPlayer(JSON.parse(savedPlayer));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(PLAYER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(PLAYER_KEY, JSON.stringify(data.player));
    setToken(data.token);
    setPlayer(data.player);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(PLAYER_KEY, JSON.stringify(data.player));
    setToken(data.token);
    setPlayer(data.player);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PLAYER_KEY);
    setToken(null);
    setPlayer(null);
  };

  return (
    <AuthContext.Provider value={{ player, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
