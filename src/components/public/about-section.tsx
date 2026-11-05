
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Award,
  BriefcaseBusiness,
  Code2,
  GraduationCap,
  Heart,
  Lightbulb,
  LoaderCircle,
  Sparkles,
  Star,
  Target,
  Users,
} from "lucide-react";

type Category = "STRENGTH" | "VALUE" | "INTEREST";

type Highlight = {
  label: string;
  value: string;
  sortOrder: number;
};

type Strength = {
  title: string;
  description: string | null;
  category: Category;
  sortOrder: number;
};

type AboutData = {
  sectionTitle: string;
  subtitle: string;
  biography: string;
  imageUrl: string | null;
  professionalRole: string | null;
  professionalStatus: string | null;
  yearsOfExperience: number;
  projectsCompleted: number;
  happyClients: number;
  highlights: Highlight[];
  strengths: Strength[];
};

const statConfig = [
  {
    key: "yearsOfExperience",
    label: "Years of Experience",
    icon: BriefcaseBusiness,
    suffix: "+",
  },
  {
    key: "projectsCompleted",
    label: "Projects Completed",
    icon: Code2,
    suffix: "+",
  },
  {
    key: "happyClients",
    label: "Happy Clients",
    icon: Users,
    suffix: "+",
  },
] as const;

const categoryConfig: {
  key: Category;
  title: string;
  description: string;
  icon: typeof Star;
}[] = [
  {
    key: "STRENGTH",
    title: "Strengths",
    description: "The qualities I bring to my work.",
    icon: Lightbulb,
  },
  {
    key: "VALUE",
    title: "Values",
    description: "The principles that guide me.",
    icon: Star,
  },
  {
    key: "INTEREST",
    title: "Interests",
    description: "What inspires me to keep exploring.",
    icon: Heart,
  },
];

function useCountUp(target: number, duration = 1600) {
  const [value, setValue] = useState(0);
  const [start, setStart] = useState(false);
  const previousTarget = useRef(target);

  useEffect(() => {
    setValue(0);
    setStart(false);
    previousTarget.current = target;
  }, [target]);

  useEffect(() => {
    if (!start || target <= 0) {
      setValue(0);
      return;
    }

    let frame = 0;
    let startTime: number | undefined;

    const animate = (timestamp: number) => {
      if (startTime === undefined) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);

      setValue(Math.round(eased * target));

      if (progress < 1) {
        frame = window.requestAnimationFrame(animate);
      }
    };

    frame = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frame);
  }, [start, target, duration]);

 return {
  value,
  start: () => setStart(true),
};
}

function AnimatedStat({
  label,
  target,
  suffix,
  icon: Icon,
}: {
  label: string;
  target: number;
  suffix: string;
  icon: typeof Star;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { value, start } = useCountUp(target);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startCounter();
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    function startCounter() {
      startSetter();
    }

    // Use the local state setter through a callback below.
    const startSetter = () => setStarted(true);

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (started) start();
  }, [started, start]);

  return (
    <div
      ref={containerRef}
      className="group flex min-w-0 flex-col items-center justify-center px-2 py-5 text-center sm:px-4 sm:py-6"
    >
      <Icon
        aria-hidden="true"
        className="mb-3 h-5 w-5 text-[#34D399] transition-transform duration-300 group-hover:-translate-y-1 sm:h-6 sm:w-6"
        strokeWidth={1.8}
      />
      <div className="flex items-baseline justify-center gap-0.5 text-2xl font-bold tracking-tight text-[#34D399] sm:text-3xl lg:text-4xl">
        <span>{value.toLocaleString()}</span>
        <span>{suffix}</span>
      </div>
      <p className="mt-2 max-w-full text-xs leading-5 text-[#A7B3AA] sm:text-sm">
        {label}
      </p>
    </div>
  );
}

export default function AboutSection() {
  const [about, setAbout] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAbout() {
      try {
        const response = await fetch("/api/about/public", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load About section.");
        }

        const result: { about: AboutData | null } = await response.json();

        if (!controller.signal.aborted) {
          setAbout(result.about);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadAbout();

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <section
        id="about"
        aria-label="About"
        className="flex min-h-80 items-center justify-center bg-[#101713] px-5"
      >
        <div className="flex items-center gap-3 text-sm text-[#A7B3AA]">
          <LoaderCircle className="h-5 w-5 animate-spin text-[#34D399]" />
          Loading About section...
        </div>
      </section>
    );
  }

  // Hidden, missing, or unavailable content should not display sample data.
  if (error || !about) return null;

  const groupedStrengths = categoryConfig.map((category) => ({
    ...category,
    items: about.strengths.filter(
      (item) => item.category === category.key,
    ),
  }));

  const hasHighlights = about.highlights.length > 0;
  const visibleGroups = groupedStrengths.filter(
    (group) => group.items.length > 0,
  );

  const hasExtraContent = hasHighlights || visibleGroups.length > 0;

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative isolate overflow-hidden bg-[#101713] text-[#F5F7F5]"
    >
      <style>{`
        @keyframes dppmsPortraitFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        @media (prefers-reduced-motion: no-preference) {
          .dppms-portrait-float {
            animation: dppmsPortraitFloat 6s ease-in-out infinite;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dppms-portrait-float {
            animation: none !important;
          }
        }
      `}</style>

      {/* Ambient background lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-32 -z-10 h-96 w-96 rounded-full bg-[#064E3B]/20 blur-[110px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-1/3 -z-10 h-96 w-96 rounded-full bg-[#34D399]/[0.07] blur-[120px]"
      />

      <div className="mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-20 lg:px-10 lg:pb-24 lg:pt-24">
        {/* Portrait and biography */}
        <div className="grid items-center gap-10 md:grid-cols-[0.78fr_1.22fr] md:gap-10 lg:gap-16 xl:gap-20">
          {/* Portrait */}
          <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[390px] md:max-w-none">
            <div
              aria-hidden="true"
              className="absolute -bottom-4 -left-4 -right-3 top-5 rounded-[2rem] border border-[#34D399]/40 sm:-bottom-5 sm:-left-5 sm:top-7 sm:rounded-[2.4rem]"
            />

            <div className="dppms-portrait-float relative aspect-[3/4] overflow-hidden rounded-[1.7rem] border border-[#34D399]/35 bg-[#17221B] shadow-[0_20px_80px_-25px_rgba(52,211,153,0.25)] sm:rounded-[2rem]">
              {about.imageUrl ? (
                <img
                  src={about.imageUrl}
                  alt={
                    about.professionalRole
                      ? `Portrait of ${about.professionalRole}`
                      : "Profile portrait"
                  }
                  className="h-full w-full object-cover object-center"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#1D2B22] via-[#101713] to-[#062C20] px-6 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#34D399]/30 bg-[#34D399]/10">
                    <Sparkles className="h-9 w-9 text-[#34D399]" />
                  </div>
                  <p className="text-sm text-[#A7B3AA]">
                    Add a profile image in Admin About
                  </p>
                </div>
              )}

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#062C20]/35 via-transparent to-white/[0.03]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#101713]/30 to-transparent"
              />
            </div>

            <div
              aria-hidden="true"
              className="absolute -bottom-7 left-1/2 h-8 w-3/5 -translate-x-1/2 rounded-full bg-[#34D399]/20 blur-2xl"
            />
          </div>

          {/* About content */}
          <div className="min-w-0 pt-2 md:pt-0">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-9 bg-[#34D399]" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#34D399] sm:text-sm">
                {about.sectionTitle}
              </span>
            </div>

            <h2
              id="about-heading"
              className="max-w-3xl text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl md:text-4xl lg:text-5xl xl:text-[3.5rem]"
            >
              {about.subtitle}
            </h2>

            {(about.professionalRole || about.professionalStatus) && (
              <div className="mt-6 flex flex-wrap gap-2.5">
                {about.professionalRole && (
                  <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#34D399]/30 bg-[#34D399]/[0.06] px-3.5 py-2 text-xs font-medium text-[#A7F3D0] sm:text-sm">
                    <Code2 className="h-4 w-4 shrink-0 text-[#34D399]" />
                    <span className="break-words">
                      {about.professionalRole}
                    </span>
                  </span>
                )}

                {about.professionalStatus && (
                  <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#29382F] bg-[#17221B]/70 px-3.5 py-2 text-xs font-medium text-[#D5DED7] sm:text-sm">
                    <GraduationCap className="h-4 w-4 shrink-0 text-[#34D399]" />
                    <span className="break-words">
                      {about.professionalStatus}
                    </span>
                  </span>
                )}
              </div>
            )}

            <div className="mt-6 max-w-3xl whitespace-pre-line break-words text-sm leading-7 text-[#B7C3BA] sm:text-base sm:leading-8">
              {about.biography}
            </div>

            {/* Animated database statistics */}
            <div className="mt-9 grid grid-cols-3 divide-x divide-[#34D399]/15 overflow-hidden rounded-2xl border border-[#34D399]/20 bg-[#101713]/70 sm:mt-10">
              {statConfig.map((stat) => (
                <AnimatedStat
                  key={stat.key}
                  label={stat.label}
                  target={about[stat.key]}
                  suffix={stat.suffix}
                  icon={stat.icon}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Optional achievements and personal qualities */}
        {hasExtraContent && (
          <div className="mt-20 grid items-start gap-8 border-t border-[#29382F]/80 pt-12 sm:mt-24 sm:pt-14 lg:grid-cols-2 lg:gap-10">
            {/* Achievement highlights */}
            {hasHighlights && (
              <div className="min-w-0">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#34D399]/20 bg-[#34D399]/10">
                    <Award className="h-5 w-5 text-[#34D399]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold sm:text-xl">
                      Achievement Highlights
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[#A7B3AA] sm:text-sm">
                      Milestones that matter to me.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {about.highlights.map((item, index) => (
                    <article
                      key={`${item.label}-${index}`}
                      className="group flex min-w-0 items-start gap-4 rounded-2xl border border-[#29382F] bg-[#17221B]/65 p-4 transition-colors duration-300 hover:border-[#34D399]/35 hover:bg-[#17221B]"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#34D399]/20 bg-[#34D399]/10">
                        <Star className="h-5 w-5 text-[#34D399]" />
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <h4 className="break-words text-sm font-semibold text-[#F5F7F5] sm:text-base">
                          {item.label}
                        </h4>
                        <p className="mt-1 break-words text-sm leading-6 text-[#A7B3AA]">
                          {item.value}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths, values, interests */}
            {visibleGroups.length > 0 && (
              <div className="min-w-0 space-y-8">
                {visibleGroups.map((group) => {
                  const GroupIcon = group.icon;

                  return (
                    <div key={group.key}>
                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#34D399]/20 bg-[#34D399]/10">
                          <GroupIcon className="h-5 w-5 text-[#34D399]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold sm:text-xl">
                            {group.title}
                          </h3>
                          <p className="mt-1 text-xs leading-5 text-[#A7B3AA] sm:text-sm">
                            {group.description}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {group.items.map((item, index) => (
                          <article
                            key={`${item.title}-${index}`}
                            className="min-w-0 rounded-2xl border border-[#29382F] bg-[#17221B]/65 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#34D399]/35"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#34D399]/10">
                                <Target className="h-4 w-4 text-[#34D399]" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="break-words text-sm font-semibold text-[#A7F3D0] sm:text-base">
                                  {item.title}
                                </h4>
                                {item.description && (
                                  <p className="mt-2 break-words text-sm leading-6 text-[#A7B3AA]">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="mt-16 flex items-center justify-center gap-4 text-center sm:mt-20">
          <span className="h-px w-8 shrink-0 bg-[#34D399]/70 sm:w-14" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6EE7B7] sm:text-xs sm:tracking-[0.3em]">
            Building a better digital tomorrow
          </p>
          <span className="h-px w-8 shrink-0 bg-[#34D399]/70 sm:w-14" />
        </div>
      </div>
    </section>
  );
}
