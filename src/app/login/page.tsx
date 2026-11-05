
import { LoginForm } from "@/components/auth/login-form";
import { ArrowUpRight, Layers3, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-[#101713] text-[#F5F7F5]">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-24 h-80 w-80 rounded-full bg-[#34D399]/[0.08] blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#34D399]/[0.05] blur-[120px]"
      />

      {/* Fixed top-left brand and top-right badge */}
      <header className="relative z-20 flex w-full shrink-0 items-center justify-between bg-[#101713]/95 px-5 py-5 sm:px-8 sm:py-6 lg:px-12">
        <a href="/login" className="group flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#34D399]/30 bg-[#17221B] text-[#34D399] shadow-lg shadow-black/20 transition-colors group-hover:bg-[#1D2B22]">
            <ShieldCheck size={25} strokeWidth={1.8} />
          </div>

          <div>
            <div className="text-xl font-bold tracking-tight sm:text-2xl">
              DPPMS<span className="text-[#34D399]">.</span>
            </div>
            <p className="mt-0.5 text-[10px] font-medium tracking-[0.16em] text-[#A7B3AA] sm:text-xs">
              PORTFOLIO MANAGEMENT SYSTEM
            </p>
          </div>
        </a>

        <div className="hidden items-center gap-2 rounded-full border border-[#29382F] bg-[#17221B]/70 px-3 py-2 sm:flex">
          <span className="h-2 w-2 rounded-full bg-[#34D399] shadow-[0_0_10px_#34D399]" />
          <span className="text-xs text-[#A7B3AA]">
            Private workspace
          </span>
        </div>
      </header>

      {/* Only the login content area scrolls */}
      <section className="relative z-10 flex min-h-0 flex-1 justify-center overflow-y-auto overscroll-contain px-4 pt-0 pb-5 sm:px-6 sm:pb-8">
        <div className="my-auto w-full max-w-[440px] shrink-0">
          {/* Tall premium login card */}
          <div className="relative overflow-hidden rounded-3xl border border-[#34463A] bg-gradient-to-b from-[#1D2B22] to-[#17221B] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-9">
            <div
              aria-hidden="true"
              className="absolute left-8 right-8 top-0 h-px bg-gradient-to-r from-transparent via-[#34D399]/70 to-transparent"
            />

            <div className="mb-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#34D399]/20 bg-[#34D399]/10 text-[#34D399]">
                <Layers3 size={23} strokeWidth={1.7} />
              </div>

              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Sign in to DPPMS
              </h2>


            </div>

            <LoginForm />

            <div className="my-7 h-px bg-[#344238]" />

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#101713] text-[#34D399]">
                <ShieldCheck size={18} />
              </div>

              <div>
                <p className="text-sm font-medium text-[#E4EBE5]">
                  Your workspace. Your control.
                </p>
                <p className="mt-1 text-xs leading-5 text-[#A7B3AA]">
                  Secure access reserved for the authorized portfolio
                  administrator.
                </p>
              </div>
            </div>
          </div>

          {/* Small supporting line */}
          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-[#718077]">
            Built for your next chapter
            <ArrowUpRight size={13} className="text-[#34D399]" />
          </p>
        </div>
      </section>

      {/* Fixed footer */}

    </main>
  );
}
