
"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  CalendarDays,
  GraduationCap,
  Sparkles,
} from "lucide-react";

type Education = {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  isCurrentlyStudying: boolean;
  grade: string | null;
  institutionLogo: string | null;
};

function year(date: string) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? ""
    : new Intl.DateTimeFormat("en", { year: "numeric" }).format(parsed);
}

function period(item: Education) {
  const start = year(item.startDate);
  const end = item.isCurrentlyStudying
    ? "Present"
    : item.endDate
      ? year(item.endDate)
      : "In progress";

  return `${start} — ${end}`;
}

export default function PublicEducation() {
  const [items, setItems] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const response = await fetch("/api/education/public");

        if (!response.ok) throw new Error("Education request failed");

        const data: Education[] = await response.json();

        if (mounted) {
          setItems(data);
          setError(false);
        }
      } catch {
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  if (!loading && !error && items.length === 0) return null;

  const reveal = {
    initial: reduceMotion ? false : { opacity: 0, y: 20 },
    whileInView: reduceMotion ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 as const },
    transition: { duration: reduceMotion ? 0 : 0.6, ease: "easeOut" as const },
  };

  return (
    <section
      id="education"
      aria-labelledby="education-title"
      className="relative isolate overflow-hidden bg-[#101713] px-4 pb-20 pt-14 text-[#F5F5F0] sm:px-6 sm:pb-24 sm:pt-16 md:px-8 md:pt-20 lg:px-12 lg:pb-28"
    >
      {/* Subtle ambient lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-0 -z-10 h-80 w-80 rounded-full bg-emerald-400/[0.07] blur-[100px] sm:h-[28rem] sm:w-[28rem]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-40 -z-10 h-80 w-80 rounded-full bg-emerald-950/40 blur-[100px]"
      />

      <div className="mx-auto max-w-7xl">
        {/* Introduction */}
        <motion.div
          {...reveal}
          className="mb-10 grid gap-7 sm:mb-12 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-10 lg:mb-16"
        >
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-3 sm:mb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#34D399] sm:text-xs">
                Education
              </span>
              <span className="h-px w-9 bg-[#34D399]" />
            </div>

            <h2
              id="education-title"
              className="max-w-3xl text-[clamp(2.2rem,6vw,4.5rem)] font-medium leading-[1.08] tracking-[-0.045em]"
            >
              Academic foundation
              <br className="hidden sm:block" /> for a{" "}
              <span className="font-serif italic text-[#34D399]">
                bigger vision.
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#A7B3AA] sm:mt-6 sm:text-base sm:leading-8">
              My education has strengthened my analytical thinking,
              problem-solving skills, and technical foundation—preparing me
              to approach complex challenges with curiosity and purpose.
            </p>
          </div>

          <div className="flex items-center gap-4 border-t border-white/10 pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0 lg:pl-9">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#34D399]/40 text-[#6EE7B7] sm:h-14 sm:w-14">
              <GraduationCap
                aria-hidden="true"
                className="h-6 w-6 sm:h-7 sm:w-7"
                strokeWidth={1.4}
              />
            </div>
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-light tracking-tight sm:text-4xl">
                  {loading ? "—" : error ? "—" : items.length}
                </span>
                <span className="h-px w-6 bg-[#34D399]" />
              </div>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#A7B3AA] sm:text-xs">
                Education records
              </p>
              <p className="mt-2 text-xs italic text-[#6F8276]">
                Continuous growth.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Education timeline */}
        {loading ? (
          <div
            className="space-y-5"
            aria-busy="true"
            aria-label="Loading education"
          >
            {[0, 1].map((item) => (
              <div
                key={item}
                className="h-44 animate-pulse rounded-2xl border border-white/[0.08] bg-white/[0.025] sm:h-48"
              />
            ))}
          </div>
        ) : error ? (
          <div
            role="status"
            className="rounded-xl border border-white/10 bg-white/[0.025] p-5 text-sm text-[#A7B3AA] sm:p-7"
          >
            Education information is temporarily unavailable. Please try again later.
          </div>
        ) : (
          <div className="relative">
            {/* Timeline rail */}
            <div
              aria-hidden="true"
              className="absolute bottom-8 left-[15px] top-7 w-px bg-gradient-to-b from-[#34D399] via-[#34D399]/35 to-transparent sm:left-[23px]"
            />

            <div className="space-y-5 sm:space-y-6 lg:space-y-7">
              {items.map((item, index) => (
                <motion.article
                  key={item.id}
                  initial={
                    reduceMotion ? false : { opacity: 0, y: 24 }
                  }
                  whileInView={
                    reduceMotion ? undefined : { opacity: 1, y: 0 }
                  }
                  viewport={{ once: true, amount: 0.12 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.55,
                    delay: reduceMotion ? 0 : Math.min(index * 0.08, 0.32),
                    ease: "easeOut",
                  }}
                  className="relative grid grid-cols-[32px_minmax(0,1fr)] gap-3 sm:grid-cols-[48px_minmax(0,1fr)] sm:gap-5 lg:grid-cols-[120px_24px_minmax(0,1fr)] lg:gap-5"
                >
                  {/* Date column on desktop */}
                  <div className="hidden items-start justify-end pt-8 text-right lg:flex">
                    <div>
                      <p className="text-sm font-medium tabular-nums text-[#F5F5F0]">
                        {year(item.startDate)}
                      </p>
                      <p className="mt-1 text-xs text-[#A7B3AA]">
                        {item.isCurrentlyStudying
                          ? "Present"
                          : item.endDate
                            ? year(item.endDate)
                            : "In progress"}
                      </p>
                    </div>
                  </div>

                  {/* Timeline marker */}
                  <div className="relative z-10 flex justify-center pt-8">
                    <span className="relative flex h-3 w-3 items-center justify-center">
                      <span className="absolute h-3 w-3 rounded-full bg-[#34D399]/20 transition-transform duration-300 group-hover:scale-150" />
                      <span className="h-2 w-2 rounded-full bg-[#34D399] shadow-[0_0_14px_rgba(52,211,153,0.65)]" />
                    </span>
                  </div>

                  {/* Qualification panel */}
                  <div className="group relative min-w-0 overflow-hidden rounded-xl border border-[#34D399]/15 bg-gradient-to-br from-[#17221B] via-[#111A15] to-[#101713] p-4 transition duration-300 hover:border-[#34D399]/40 hover:shadow-[0_12px_45px_rgba(0,0,0,0.18)] sm:rounded-2xl sm:p-6 lg:p-7">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full border border-[#34D399]/[0.07] transition-transform duration-700 group-hover:scale-110"
                    />

                    <div className="relative flex min-w-0 flex-col gap-4 sm:flex-row sm:gap-5 lg:gap-6">
                      {/* Institution logo */}
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#34D399]/15 bg-[#1D2B22] sm:h-16 sm:w-16">
                        {item.institutionLogo ? (
                          <img
                            src={item.institutionLogo}
                            alt={`${item.institution} logo`}
                            loading="lazy"
                            className="h-full w-full object-contain p-1.5"
                          />
                        ) : (
                          <GraduationCap
                            aria-hidden="true"
                            className="h-6 w-6 text-[#6EE7B7] sm:h-8 sm:w-8"
                            strokeWidth={1.4}
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* Status and dates */}
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs text-[#A7B3AA]">
                            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#34D399]" />
                            <span>{period(item)}</span>
                          </span>

                          <span className="rounded-full border border-[#34D399]/20 bg-[#34D399]/[0.07] px-2.5 py-1 text-[10px] font-medium text-[#6EE7B7]">
                            {item.isCurrentlyStudying
                              ? "In progress"
                              : item.endDate
                                ? "Completed"
                                : "Recorded"}
                          </span>
                        </div>

                        <h3 className="break-words text-lg font-semibold leading-snug tracking-[-0.02em] text-[#F5F5F0] sm:text-xl lg:text-2xl">
                          {item.degree}
                        </h3>

                        <p className="mt-2 break-words text-sm font-medium leading-6 text-[#6EE7B7] sm:text-base">
                          {item.fieldOfStudy}
                        </p>

                        <p className="mt-2 break-words text-sm leading-6 text-[#D0D8D1]">
                          {item.institution}
                        </p>

                        {/* Compact mobile dates */}
                        <p className="mt-3 text-xs text-[#A7B3AA] lg:hidden">
                          {period(item)}
                        </p>

                        {item.description && (
                          <p className="mt-4 max-w-3xl whitespace-pre-line break-words text-sm leading-7 text-[#A7B3AA] sm:mt-5">
                            {item.description}
                          </p>
                        )}

                        {item.grade && (
                          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.08] pt-4 text-xs sm:text-sm">
                            <Sparkles className="h-4 w-4 shrink-0 text-[#34D399]" />
                            <span className="text-[#A7B3AA]">
                              Academic result
                            </span>
                            <span className="break-words font-medium text-[#F5F5F0]">
                              {item.grade}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] text-[#6F8276] transition duration-300 group-hover:border-[#34D399]/30 group-hover:text-[#6EE7B7] sm:right-1 sm:top-1">
                        <ArrowUpRight
                          aria-hidden="true"
                          className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        )}

        {/* Closing statement */}
        <motion.div
          {...reveal}
          className="mt-10 flex flex-wrap items-center gap-3 border-t border-white/[0.08] pt-5 sm:mt-14 sm:pt-6"
        >
          <span className="h-px w-6 bg-[#34D399] sm:w-8" />
          <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-[#A7B3AA] sm:text-[10px] sm:tracking-[0.23em]">
            Continuous learning
            <span className="mx-2 text-[#34D399]">/</span>
            Better solutions
            <span className="mx-2 text-[#34D399]">/</span>
            Greater impact
          </p>
        </motion.div>
      </div>
    </section>
  );
}
