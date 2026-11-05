
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Code2, Menu, X } from "lucide-react";

const navigation = [
  { label: "Home", href: "/#home", section: "home" },
  { label: "About", href: "/#about", section: "about" },
  { label: "Education", href: "/#education", section: "education" },
  { label: "Skills", href: "/#skills", section: "skills" },
  { label: "Experience", href: "/#experience", section: "experience" },
  { label: "Projects", href: "/#projects", section: "projects" },
  { label: "Certificates", href: "/certificates", section: "certificates" },
  { label: "Gallery", href: "/gallery", section: "gallery" },
  { label: "Contact", href: "/#contact", section: "contact" },
];

function getRouteSection(pathname: string) {
  return navigation.find(
    (item) =>
      !item.href.includes("#") && item.href === pathname,
  )?.section;
}

export function PublicHeader() {
  const pathname = usePathname();
  const routeSection = getRouteSection(pathname);

  const [activeSection, setActiveSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  const currentActiveSection =
    pathname === "/" ? activeSection : routeSection ?? "";

  // Track the visible section on the homepage.
  useEffect(() => {
    if (pathname !== "/") return;

    let frameId = 0;

    const updateActiveSection = () => {
      const sections = navigation
        .filter((item) => item.href.startsWith("/#"))
        .map((item) => document.getElementById(item.section))
        .filter((section): section is HTMLElement => section !== null);

      if (sections.length === 0) return;

      let current = sections[0].id;

      for (const section of sections) {
        if (section.getBoundingClientRect().top <= 160) {
          current = section.id;
        }
      }

      setActiveSection(current);
    };

    // Schedule the initial measurement instead of updating state
    // synchronously inside the effect.
    frameId = window.requestAnimationFrame(updateActiveSection);

    window.addEventListener("scroll", updateActiveSection, {
      passive: true,
    });

    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [pathname]);

  // Close the drawer with Escape and lock background scrolling.
  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[#29382F] bg-[#101713]/95 text-[#F5F7F5] backdrop-blur-xl">
        <div className="mx-auto flex min-h-[76px] w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:gap-6 lg:px-10">
          {/* Brand: left side */}
          <Link
            href="/#home"
            aria-label="Go to homepage"
            className="group flex min-w-0 shrink-0 items-center gap-3"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#6EE7B7]/30 bg-[#17221B] text-[#34D399] transition duration-300 group-hover:border-[#34D399] group-hover:bg-[#34D399] group-hover:text-[#101713] sm:size-11">
              <Code2 size={23} strokeWidth={2.2} />
            </span>

            <span className="flex min-w-0 flex-col justify-center">
              <span className="truncate text-sm font-bold tracking-[0.12em] text-[#F5F7F5] sm:text-base">
                TOLESA
              </span>
              <span className="mt-1 whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.12em] text-[#A7B3AA] sm:text-[11px] sm:tracking-[0.15em]">
                WEB DEVELOPER
              </span>
            </span>
          </Link>

          {/* Desktop navigation: same horizontal row */}
          <nav
            aria-label="Main navigation"
            className="hidden items-center justify-end gap-1 xl:flex"
          >
            {navigation.map((item) => {
              const isActive =
                currentActiveSection === item.section;

              return (
                <Link
                  key={item.section}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                 className={`group relative whitespace-nowrap rounded-lg px-2.5 py-2 text-[17px] font-medium transition-all duration-300 ease-out hover:-translate-y-1 hover:rotate-[-2deg] hover:scale-105 hover:shadow-[0_5px_18px_rgba(52,211,153,0.12)] 2xl:px-3 2xl:text-[13px] ${
  isActive
    ? "bg-[#34D399]/10 text-[#6EE7B7]"
    : "text-[#A7B3AA] hover:bg-[#1D2B22] hover:text-[#34D399]"
}`}
                >
                  {item.label}

                  <span
                    className={`absolute bottom-1 left-2.5 right-2.5 h-0.5 origin-left rounded-full bg-[#34D399] transition-transform duration-200 ${
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Compact menu for mobile, tablet, and smaller laptops */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#29382F] bg-[#17221B] text-[#6EE7B7] transition hover:border-[#34D399] hover:bg-[#1D2B22] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34D399] xl:hidden"
          >
            <Menu size={23} />
          </button>
        </div>
      </header>

      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 xl:hidden ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Right-side sliding mobile navigation */}
      <aside
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        className={`fixed inset-y-0 right-0 z-[70] flex w-[min(88vw,380px)] flex-col border-l border-[#29382F] bg-[#101713] text-[#F5F7F5] shadow-2xl transition-transform duration-300 ease-out xl:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex min-h-[88px] items-center justify-between border-b border-[#29382F] px-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#17221B] text-[#34D399]">
              <Code2 size={21} />
            </span>

            <div>
              <p className="text-sm font-bold tracking-[0.12em] text-[#F5F7F5]">
                TOLESA
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[#A7B3AA]">
                Web Developer
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation menu"
            className="flex size-10 items-center justify-center rounded-xl border border-[#29382F] text-[#D2DED5] transition hover:border-[#34D399] hover:bg-[#1D2B22] hover:text-[#6EE7B7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34D399]"
          >
            <X size={21} />
          </button>
        </div>

        <nav
          aria-label="Mobile main navigation"
          className="flex-1 overflow-y-auto p-4"
        >
          <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A7B3AA]">
            Explore portfolio
          </p>

          <div className="space-y-1.5">
            {navigation.map((item, index) => {
              const isActive =
                currentActiveSection === item.section;

              return (
                <Link
                  key={item.section}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    transitionDelay: menuOpen
                      ? `${index * 25}ms`
                      : "0ms",
                  }}
                  className={`group flex items-center justify-between rounded-xl border px-4 py-3.5 transition-colors duration-200 ${
                    isActive
                      ? "border-[#34D399]/30 bg-[#34D399]/10 text-[#6EE7B7]"
                      : "border-transparent text-[#D2DED5] hover:border-[#29382F] hover:bg-[#17221B] hover:text-[#6EE7B7]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`size-1.5 rounded-full ${
                        isActive
                          ? "bg-[#34D399]"
                          : "bg-[#536258]"
                      }`}
                    />
                    <span className="text-sm font-medium">
                      {item.label}
                    </span>
                  </span>

                  <ArrowUpRight
                    size={16}
                    className={`transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${
                      isActive
                        ? "text-[#34D399]"
                        : "text-[#536258]"
                    }`}
                  />
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-[#29382F] p-5">
          <p className="text-xs leading-6 text-[#A7B3AA]">
            Thoughtful design. Reliable code. Meaningful digital
            experiences.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#34D399]" />
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#6EE7B7]">
              Portfolio &amp; Projects
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
