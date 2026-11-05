import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { auth } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminThemeProvider } from "@/components/admin/admin-theme-provider";
import { AdminThemeToggle } from "@/components/admin/admin-theme-toggle";

export const instant = false;

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/login?error=unauthorized");
  }

  return (
    <AdminThemeProvider>
      <div className="min-h-screen bg-[#101713] text-[#F5F7F5] lg:flex">
        <AdminSidebar />

        <div className="min-w-0 flex-1">
          <header className="sticky top-[72px] z-20 flex min-h-[76px] items-center justify-between gap-3 border-b border-[#29382F] bg-[#101713]/95 px-4 py-4 backdrop-blur-xl sm:px-7 lg:top-0 lg:px-10">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#F5F7F5]">
                Admin workspace
              </p>

              <p className="mt-1 truncate text-xs text-[#A7B3AA]">
                Signed in as {session.user.name}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#34463A] bg-[#17221B] px-3 text-sm font-medium text-[#6EE7B7] transition hover:border-[#34D399]/50 hover:bg-[#1D2B22] sm:px-4"
              >
                <ExternalLink size={16} />

                <span className="hidden sm:inline">
                  View Public Site
                </span>

                <span className="sm:hidden">View Site</span>
              </Link>

              <AdminThemeToggle />

              <LogoutButton />
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-7 sm:py-9 lg:px-10 lg:py-10">
            {children}
          </main>
        </div>
      </div>
    </AdminThemeProvider>
  );
}