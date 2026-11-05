
import Link from "next/link";
import {
  ArrowRight,
  Activity,
  Award,
  BriefcaseBusiness,
  Code2,
  FolderKanban,
  GraduationCap,
  Images,
  Mail,
  PanelsTopLeft,
  Plus,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

const stats = [
  {
    label: "Total projects",
    value: "—",
    note: "Connect project data to display",
    icon: FolderKanban,
  },
  {
    label: "Published projects",
    value: "—",
    note: "Publication data not connected",
    icon: PanelsTopLeft,
  },
  {
    label: "Portfolio sections",
    value: "13",
    note: "Sections planned for your workspace",
    icon: UserRound,
  },
  {
    label: "Portfolio views",
    value: "—",
    note: "Analytics not configured",
    icon: Activity,
  },
];

const managementSections = [
  {
    title: "Hero Section",
    description: "Manage your headline, introduction, and homepage buttons.",
    href: "/admin/hero",
    icon: PanelsTopLeft,
  },
  {
    title: "About",
    description: "Update your professional bio and profile information.",
    href: "/admin/profile",
    icon: UserRound,
  },
  {
    title: "Education",
    description: "Manage your academic background and qualifications.",
    href: "/admin/education",
    icon: GraduationCap,
  },
  {
    title: "Skills",
    description: "Organize your technologies, tools, and expertise.",
    href: "/admin/skills",
    icon: Code2,
  },
  {
    title: "Experience",
    description: "Manage work history, internships, and responsibilities.",
    href: "/admin/experience",
    icon: BriefcaseBusiness,
  },
  {
    title: "Projects",
    description: "Showcase projects, technologies, images, and links.",
    href: "/admin/projects",
    icon: FolderKanban,
  },
  {
    title: "Certificates",
    description: "Manage credentials, certificates, and achievements.",
    href: "/admin/certificates",
    icon: Award,
  },
  {
    title: "Gallery",
    description: "Organize images and other portfolio visuals.",
    href: "/admin/gallery",
    icon: Images,
  },
  {
    title: "Contact",
    description: "Update contact details and social media links.",
    href: "/admin/contact",
    icon: Mail,
  },
  {
    title: "Appearance",
    description: "Customize portfolio themes, colors, and presentation.",
    href: "/admin/appearance",
    icon: Sparkles,
  },
  {
    title: "Site Settings",
    description: "Manage website metadata and global preferences.",
    href: "/admin/settings",
    icon: Settings2,
  },
  {
    title: "Account & Security",
    description: "Manage administrator account and security settings.",
    href: "/admin/security",
    icon: ShieldCheck,
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page heading */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#34D399]/20 bg-[#34D399]/[0.07] px-3 py-1.5 text-xs font-medium text-[#6EE7B7]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" />
            Your private workspace
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Dashboard overview
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#A7B3AA]">
            Manage your portfolio content, organize your projects, and
            build your professional presence from one place.
          </p>
        </div>

        <Link
          href="/admin/projects"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#34D399] px-4 py-2.5 text-sm font-semibold text-[#062C20] transition hover:bg-[#6EE7B7]"
        >
          <Plus size={17} />
          New project
        </Link>
      </section>

      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-2xl border border-[#34463A] bg-gradient-to-br from-[#1D2B22] via-[#17221B] to-[#132019] p-5 sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-[#34D399]/[0.08] blur-[80px]"
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <div className="mb-3 flex items-center gap-2 text-[#6EE7B7]">
              <Sparkles size={17} />
              <span className="text-xs font-semibold uppercase tracking-[0.15em]">
                Your next chapter starts here
              </span>
            </div>

            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Make your work speak for itself.
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#A7B3AA]">
              Start by setting up your profile and adding your projects.
              You can manage every portfolio section from this dashboard.
            </p>
          </div>

          <Link
            href="/admin/profile"
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-[#49614F] bg-[#101713]/50 px-4 py-3 text-sm font-medium text-[#E4EBE5] transition hover:border-[#34D399]/50 hover:bg-[#101713] sm:self-center"
          >
            Set up profile <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Statistics */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold">Portfolio overview</h2>
          <p className="mt-1 text-xs text-[#A7B3AA]">
            Live statistics will appear when the relevant features are
            connected to the database.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article
                key={stat.label}
                className="rounded-2xl border border-[#29382F] bg-[#17221B]/80 p-5 transition hover:border-[#49614F]"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-[#A7B3AA]">{stat.label}</p>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#34D399]/15 bg-[#34D399]/[0.07] text-[#6EE7B7]">
                    <Icon size={19} strokeWidth={1.8} />
                  </div>
                </div>

                <p className="mt-5 text-3xl font-semibold tracking-tight">
                  {stat.value}
                </p>

                <p className="mt-2 text-xs leading-5 text-[#718077]">
                  {stat.note}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Portfolio section management */}
      <section>
        <div className="mb-5">
          <h2 className="text-base font-semibold">
            Manage your portfolio
          </h2>

          <p className="mt-1 text-xs leading-5 text-[#A7B3AA]">
            Choose a section to manage its content and settings.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {managementSections.map((section) => {
            const Icon = section.icon;

            return (
              <Link
                key={section.href}
                href={section.href}
                className="group flex min-w-0 gap-4 rounded-2xl border border-[#29382F] bg-[#17221B]/60 p-4 transition hover:border-[#34D399]/35 hover:bg-[#1D2B22] sm:p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#34D399]/15 bg-[#34D399]/[0.07] text-[#6EE7B7] transition group-hover:bg-[#34D399]/15">
                  <Icon size={20} strokeWidth={1.8} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-[#E4EBE5]">
                      {section.title}
                    </h3>

                    <ArrowRight
                      size={16}
                      className="mt-0.5 shrink-0 text-[#718077] transition group-hover:translate-x-1 group-hover:text-[#34D399]"
                    />
                  </div>

                  <p className="mt-2 text-xs leading-5 text-[#A7B3AA]">
                    {section.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent activity */}
      <section className="rounded-2xl border border-[#29382F] bg-[#17221B]/60 p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#29382F] bg-[#101713] text-[#6EE7B7]">
            <Activity size={19} />
          </div>

          <div>
            <h2 className="text-base font-semibold">Recent activity</h2>
            <p className="mt-1 text-xs text-[#A7B3AA]">
              Your latest portfolio updates
            </p>
          </div>
        </div>

        <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-[#34463A] px-5 py-8 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1D2B22] text-[#6EE7B7]">
            <Activity size={22} strokeWidth={1.7} />
          </div>

          <h3 className="text-sm font-medium">
            No activity to display yet
          </h3>

          <p className="mt-2 max-w-sm text-xs leading-5 text-[#A7B3AA]">
            Recent changes will appear here after activity tracking is
            implemented.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col gap-2 border-t border-[#29382F] pt-5 text-xs text-[#718077] sm:flex-row sm:items-center sm:justify-between">
        <p>DPPMS · Portfolio Management System</p>
        <p>Built for your next chapter.</p>
      </footer>
    </div>
  );
}
