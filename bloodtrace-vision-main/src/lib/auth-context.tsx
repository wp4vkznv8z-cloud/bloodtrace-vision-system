import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Investigator = {
  badge: string;
  name: string;
  rank: string;
  division: string;
  clearance: "L1" | "L2" | "L3" | "L4";
  password: string;
  avatar: string;
};

export const INVESTIGATORS: Investigator[] = [
  { badge: "K-2147", name: "Det. Rachel Cortez", rank: "Lead Investigator", division: "Homicide / BPA Unit", clearance: "L4", password: "forensic", avatar: "RC" },
  { badge: "K-1102", name: "Lt. Marcus Vale", rank: "Forensic Lieutenant", division: "Crime Scene Division", clearance: "L4", password: "forensic", avatar: "MV" },
  { badge: "K-3398", name: "Spec. Amira Khan", rank: "DNA / Trace Analyst", division: "Biology Lab", clearance: "L3", password: "forensic", avatar: "AK" },
  { badge: "K-4721", name: "Off. Daniel Hwang", rank: "Field Investigator", division: "Patrol / Evidence", clearance: "L2", password: "forensic", avatar: "DH" },
];

type Ctx = {
  user: Investigator | null;
  login: (badge: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
  ready: boolean;
};

const AuthContext = createContext<Ctx | null>(null);
const KEY = "btis_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Investigator | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const badge = JSON.parse(raw).badge as string;
        const found = INVESTIGATORS.find((i) => i.badge === badge) ?? null;
        setUser(found);
      }
    } catch {}
    setReady(true);
  }, []);

  function login(badge: string, password: string) {
    const u = INVESTIGATORS.find((i) => i.badge.toUpperCase() === badge.toUpperCase().trim());
    if (!u) return { ok: false as const, error: "Badge number not found in registry." };
    if (u.password !== password) return { ok: false as const, error: "Access code rejected." };
    setUser(u);
    localStorage.setItem(KEY, JSON.stringify({ badge: u.badge }));
    return { ok: true as const };
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(KEY);
  }

  return <AuthContext.Provider value={{ user, login, logout, ready }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth requires AuthProvider");
  return ctx;
}
