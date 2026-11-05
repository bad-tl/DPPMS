"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PanelsTopLeft,
  UserRound,
  GraduationCap,
  Code2,
  BriefcaseBusiness,
  FolderKanban,
  Award,
  Images,
  Mail,
  Palette,
  Settings2,
  ShieldCheck,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const navigation = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    group: "Overview",
  },
  {
    label: "Hero Section",
    href: "/admin/hero",
    icon: PanelsTopLeft,
    group: "Portfolio Content",
  },
  {
    label: "About",
    href: "/admin/about",
    icon: UserRound,
    group: "Portfolio Content",
  },
  {
    label: "Education",
    href: "/admin/education",
    icon: GraduationCap,
    group: "Portfolio Content",
  },
  {
    label: "Skills",
    href: "/admin/skills",
    icon: Code2,
    group: "Portfolio Content",
  },
  {
    label: "Experience",
    href: "/admin/experience",
    icon: BriefcaseBusiness,
    group: "Portfolio Content",
  },
  {
    label: "Projects",
    href: "/admin/projects",
    icon: FolderKanban,
    group: "Portfolio Content",
  },
  {
    label: "Certificates",
    href: "/admin/certificates",
    icon: Award,
    group: "Portfolio Content",
  },
  {
    label: "Gallery",
    href: "/admin/gallery",
    icon: Images,
    group: "Portfolio Content",
  },
  {
    label: "Contact",
    href: "/admin/contact",
    icon: Mail,
    group: "Portfolio Content",
  },
  {
    label: "Appearance",
    href: "/admin/appearance",
    icon: Palette,
    group: "Configuration",
  },
  {
    label: "Site Settings",
    href: "/admin/settings",
    icon: Settings2,
    group: "Configuration",
  },
  {
    label: "Account & Security",
    href: "/admin/security",
    icon: ShieldCheck,
    group: "Configuration",
  },
];

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#34D399]/25 bg-[#34D399]/10 text-[#34D399]">
        <ShieldCheck size={23} strokeWidth={1.8} />
      </div>

      <div>
        <p className="text-lg font-bold tracking-tight text-[#F5F7F5]">
          DPPMS<span className="text-[#34D399]">.</span>
        </p>
        <p className="text-[10px] tracking-[0.16em] text-[#A7B3AA]">
          ADMIN WORKSPACE
        </p>
      </div>
    </Link>
  );
}

type NavigationLinksProps = {
  pathname: string;
  mobile?: boolean;
  onNavigate?: () => void;
};

function NavigationLinks({
  pathname,
  mobile = false,
  onNavigate,
}: NavigationLinksProps) {
  let currentGroup = "";

  function isActive(href: string) {
    return href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav aria-label="Admin navigation" className="space-y-5">
      {navigation.map(({ label, href, icon: Icon, group }) => {
        const active = isActive(href);
        const showGroup = currentGroup !== group;
        currentGroup = group;

        return (
          <div key={href}>
            {showGroup && (
              <p
                className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#718077] ${
                  group === "Overview" ? "sr-only" : ""
                }`}
              >
                {group}
              </p>
            )}

            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              onClick={() => {
                if (mobile) {
                  onNavigate?.();
                }
              }}
              className={`group flex min-h-11 items-center gap-3 rounded-xl border px-3 py-3 text-sm transition-colors ${
                active
                  ? "border-[#34D399]/15 bg-[#34D399]/10 font-medium text-[#6EE7B7]"
                  : "border-transparent text-[#A7B3AA] hover:border-[#34463A] hover:bg-[#1D2B22] hover:text-[#F5F7F5]"
              }`}
            >
              <Icon size={18} strokeWidth={1.8} />

              <span className="flex-1">{label}</span>

              {active && (
                <ChevronRight
                  size={15}
                  className="text-[#34D399]"
                />
              )}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [previousPathname, setPreviousPathname] = useState(pathname);

  // Close the drawer when navigation changes.
  // This guarded update avoids setting state inside an effect.
  if (pathname !== previousPathname) {
    setPreviousPathname(pathname);

    if (open) {
      setOpen(false);
    }
  }

  // Close the drawer when Escape is pressed.
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Prevent background scrolling while the drawer is open.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      {/* Mobile and tablet top bar */}
      <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#29382F] bg-[#101713]/95 px-4 backdrop-blur-xl lg:hidden">
        <Brand />

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="mobile-admin-navigation"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#34463A] bg-[#17221B] text-[#F5F7F5] transition hover:border-[#34D399]/40 hover:text-[#34D399]"
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      {/* Mobile and tablet backdrop */}
      {open && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/65 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Mobile and tablet slide-out drawer */}
      <aside
        id="mobile-admin-navigation"
        aria-label="Mobile admin sidebar"
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(84vw,320px)] flex-col border-r border-[#34463A] bg-[#17221B] shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#29382F] px-5">
          <Brand />

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#A7B3AA] transition hover:bg-[#29382F] hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-5">
          <NavigationLinks
            mobile
            pathname={pathname}
            onNavigate={() => setOpen(false)}
          />
        </div>

        <div className="shrink-0 border-t border-[#29382F] p-4">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#34463A] bg-[#101713] px-4 py-3 text-sm font-medium text-[#6EE7B7] transition hover:border-[#34D399]/40"
          >
            View public site <ExternalLink size={15} />
          </Link>
        </div>
      </aside>

      {/* Desktop sidebar */}
{/* Desktop sidebar */}
<aside className="sticky top-0 hidden h-screen min-h-screen w-64 shrink-0 flex-col self-start border-r border-[#29382F] bg-[#17221B] lg:flex">
  <div className="flex h-[76px] shrink-0 items-center border-b border-[#29382F] px-5">
    <Brand />
  </div>

  <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
    <NavigationLinks pathname={pathname} />
  </div>
</aside>
    </>
  );
}