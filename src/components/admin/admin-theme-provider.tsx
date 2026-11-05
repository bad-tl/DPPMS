"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type AdminTheme = "dark" | "light";

type AdminThemeContextValue = {
  theme: AdminTheme;
  toggleTheme: () => void;
};

const AdminThemeContext =
  createContext<AdminThemeContextValue | null>(null);

const STORAGE_KEY = "dppms-admin-theme";

export function AdminThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<AdminTheme>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem(STORAGE_KEY);

      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
      }
    } catch {
      // Keep the default dark theme if storage is unavailable.
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    document.documentElement.dataset.adminTheme = theme;

    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // The theme still works for the current session.
    }
  }, [theme, ready]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme }}>
      <div
        className="admin-theme-root min-h-screen"
        data-admin-theme={theme}
      >
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);

  if (!context) {
    throw new Error(
      "useAdminTheme must be used inside AdminThemeProvider.",
    );
  }

  return context;
}