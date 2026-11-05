
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    try {
      const result = await authClient.signOut();

      if (result.error) {
        setLoading(false);
        return;
      }

      window.location.assign("/login");
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-lg border border-[#3B4A40] px-4 py-2 text-sm font-medium text-[#D2DED5] transition hover:border-[#34D399] hover:text-[#34D399] disabled:opacity-60"
    >
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}
