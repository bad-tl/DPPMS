"use client";

import { Moon, Sun } from "lucide-react";
import { useAdminTheme } from "@/components/admin/admin-theme-provider";

export function AdminThemeToggle() {
  const { theme, toggleTheme } = useAdminTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#34463A] bg-[#17221B] px-3 text-sm font-medium text-[#6EE7B7] transition hover:border-[#34D399]/50 hover:bg-[#1D2B22] sm:px-3"
    >
      {isDark ? (
        <Sun size={17} aria-hidden="true" />
      ) : (
        <Moon size={17} aria-hidden="true" />
      )}

      <span className="hidden md:inline">
        {isDark ? "Light mode" : "Dark mode"}
      </span>
    </button>
  );
}