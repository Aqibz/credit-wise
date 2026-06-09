import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Ctx = {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (v: boolean) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
};
const SidebarCtx = createContext<Ctx | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Keep the sidebar visible by default. Restoring a previously-collapsed
  // state caused the app to appear "broken" after refresh for end users.
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Restore once after mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("qcrm.sidebar.collapsed", "false");
    setCollapsed(false);
    const t = localStorage.getItem("qcrm.theme") as "light" | "dark" | null;
    if (t === "dark") setTheme("dark");
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("qcrm.theme", theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("qcrm.sidebar.collapsed", String(collapsed));
  }, [collapsed]);

  return (
    <SidebarCtx.Provider
      value={{
        collapsed,
        setCollapsed,
        toggle: () => setCollapsed((v) => !v),
        theme,
        toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
      }}
    >
      {children}
    </SidebarCtx.Provider>
  );
}

export function useSidebarState() {
  const ctx = useContext(SidebarCtx);
  if (!ctx)
    return {
      collapsed: false,
      toggle: () => {},
      setCollapsed: () => {},
      theme: "light" as const,
      toggleTheme: () => {},
    };
  return ctx;
}
