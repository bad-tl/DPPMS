
"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import {
  BriefcaseBusiness,
  MapPin,
  CalendarDays,
  ArrowUpRight,
  Sparkles,
  CircleDot,
  Code2,
} from "lucide-react";

type ExperienceHighlight = {
  id: string;
  content: string;
  sortOrder: number;
};

type Experience = {
  id: string;
  company: string;
  position: string;
  employmentType: string;
  location?: string | null;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  isCurrentlyWorking: boolean;
  companyLogo?: string | null;
  isVisible: boolean;
  sortOrder: number;
  highlights: ExperienceHighlight[];
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

const formatEmploymentType = (value: string) =>
  value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function PublicExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const title = "Experience";

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 65%", "end 75%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 25,
    mass: 0.4,
  });

  const pulseY = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadExperiences() {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch("/api/experience/public", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load experiences");
        }

        const data = await response.json();

        const records = Array.isArray(data)
          ? data
          : data.experiences || [];

        setExperiences(
          records
            .filter((item: Experience) => item.isVisible)
            .sort(
              (a: Experience, b: Experience) =>
                a.sortOrder - b.sortOrder
            )
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadExperiences();

    return () => controller.abort();
  }, []);

  if (!loading && !error && experiences.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="relative isolate overflow-hidden bg-[#080F1C] py-8 sm:py-32 lg:pt-4 lg:pb-5"
    >
      {/* =====================================================
          FUTURISTIC BACKGROUND ATMOSPHERE
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">

        {/* Emerald atmosphere */}
        <motion.div
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: [0, 35, 0],
                  y: [0, 25, 0],
                  scale: [1, 1.12, 1],
                }
          }
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-64 top-10 h-[650px] w-[650px] rounded-full bg-emerald-500/[0.10] blur-[160px]"
        />

        {/* Electric blue atmosphere */}
        <motion.div
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: [0, -30, 0],
                  y: [0, 35, 0],
                  scale: [1, 1.15, 1],
                }
          }
          transition={{
            duration: 19,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-64 top-[25%] h-[700px] w-[700px] rounded-full bg-sky-500/[0.10] blur-[170px]"
        />

        {/* Center cyan lighting */}
        <div className="absolute left-1/2 top-[45%] h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.045] blur-[150px]" />

        {/* Bottom emerald lighting */}
        <div className="absolute -bottom-64 left-1/3 h-[500px] w-[700px] rounded-full bg-emerald-500/[0.07] blur-[160px]" />

        {/* Technical grid */}
        <div
          className="absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(56,189,248,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,.35) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Subtle radial overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 15%, #080F1C 90%)",
          }}
        />

        {/* Top and bottom transitions */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#080F1C] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#080F1C] to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

        {/* =====================================================
            ANIMATED SECTION HEADING
        ====================================================== */}

        <div className="mb-20 text-center">

          <motion.div
            initial={
              prefersReducedMotion
                ? false
                : { opacity: 0, y: 20, scale: 0.9 }
            }
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-sky-400/[0.07] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200 shadow-[0_0_30px_rgba(56,189,248,0.07)] backdrop-blur-xl"
          >
            <Sparkles size={15} className="text-emerald-300" />
            My professional journey
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          </motion.div>

          {/* Character-by-character title animation */}
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            className="flex flex-wrap items-center justify-center text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
          >
            {title.split("").map((char, index) => (
              <motion.span
                key={`${char}-${index}`}
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 35,
                    rotateX: -70,
                    color: "#64748B",
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    color: index % 3 === 0
                      ? "#6EE7B7"
                      : index % 3 === 1
                        ? "#F5F5F0"
                        : "#38BDF8",
                  },
                }}
                transition={{
                  duration: 0.65,
                  delay: prefersReducedMotion ? 0 : index * 0.055,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="inline-block"
                style={{ transformOrigin: "bottom" }}
              >
                {char}
              </motion.span>
            ))}

            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: prefersReducedMotion ? 0 : 0.55,
                duration: 0.5,
              }}
              className="text-emerald-400"
            >
              .
            </motion.span>
          </motion.h2>

          {/* Animated underline */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: 110, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 1,
              delay: prefersReducedMotion ? 0 : 0.55,
              ease: "easeOut",
            }}
            className="mx-auto mt-6 h-[3px] rounded-full bg-gradient-to-r from-emerald-400 via-cyan-300 to-sky-500 shadow-[0_0_18px_rgba(52,211,153,0.5)]"
          />

          <motion.p
            initial={
              prefersReducedMotion
                ? false
                : { opacity: 0, y: 20 }
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              delay: 0.35,
            }}
            className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base"
          >
          </motion.p>
        </div>

        {/* =====================================================
            LOADING STATE
        ====================================================== */}

        {loading && (
          <div className="space-y-6">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="mx-auto h-64 max-w-2xl animate-pulse rounded-2xl border border-sky-300/[0.10] bg-[#14232B]/70"
              />
            ))}
          </div>
        )}

        {/* =====================================================
            ERROR STATE
        ====================================================== */}

        {error && (
          <p className="py-12 text-center text-sm text-slate-400">
            Unable to load experience information right now.
          </p>
        )}

        {/* =====================================================
            ANIMATED CAREER TIMELINE
        ====================================================== */}

        {!loading && !error && experiences.length > 0 && (
          <div className="relative mx-auto max-w-6xl">

            {/* Timeline base */}
            <div className="absolute bottom-0 left-4 top-0 w-px bg-gradient-to-b from-cyan-400/10 via-sky-400/25 to-emerald-400/10 md:left-1/2 md:-translate-x-1/2" />

            {/* Scroll-driven progress line */}
            <motion.div
              style={{ scaleY: smoothProgress }}
              className="absolute bottom-0 left-4 top-0 w-[2px] origin-top bg-gradient-to-b from-cyan-300 via-emerald-300 to-emerald-500 shadow-[0_0_16px_rgba(52,211,153,0.75)] md:left-1/2 md:-translate-x-1/2"
            />

            {/* Moving energy pulse */}
            {!prefersReducedMotion && (
              <motion.div
                style={{ top: pulseY }}
                className="pointer-events-none absolute left-4 z-20 h-24 w-24 -translate-x-1/2 -translate-y-1/2 md:left-1/2"
              >
                <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-3xl" />
                <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-200 shadow-[0_0_25px_9px_rgba(52,211,153,0.55)]" />
              </motion.div>
            )}

            {/* Experience entries */}
            <div className="relative">
              {experiences.map((experience, index) => {
                const isLeft = index % 2 === 0;

                return (
                  <div
                    key={experience.id}
                    className="relative grid grid-cols-[32px_minmax(0,1fr)] gap-4 md:grid-cols-[1fr_64px_1fr] md:gap-0"
                  >

                    {/* Timeline milestone */}
                    <div className="relative col-start-1 row-start-1 flex justify-center md:col-start-2">
                      <motion.div
                        initial={
                          prefersReducedMotion
                            ? false
                            : { scale: 0, opacity: 0 }
                        }
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true, amount: 0.7 }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 15,
                          delay: 0.12,
                        }}
                        className="sticky top-1/2 z-10 mt-8 flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/40 bg-[#0D1B28] shadow-[0_0_22px_rgba(56,189,248,0.16)]"
                      >
                        <motion.span
                          animate={
                            prefersReducedMotion
                              ? undefined
                              : {
                                  boxShadow: [
                                    "0 0 5px rgba(52,211,153,.4)",
                                    "0 0 15px rgba(52,211,153,.9)",
                                    "0 0 5px rgba(52,211,153,.4)",
                                  ],
                                }
                          }
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                          }}
                          className="h-2.5 w-2.5 rounded-full bg-emerald-300"
                        />
                      </motion.div>
                    </div>

                    {/* Experience card */}
                    <motion.article
                      initial={
                        prefersReducedMotion
                          ? false
                          : {
                              opacity: 0,
                              x: isLeft ? -45 : 45,
                              y: 25,
                            }
                      }
                      whileInView={{
                        opacity: 1,
                        x: 0,
                        y: 0,
                      }}
                      viewport={{
                        once: true,
                        amount: 0.15,
                      }}
                      transition={{
                        duration: 0.75,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      whileHover={
                        prefersReducedMotion
                          ? undefined
                          : {
                              y: -5,
                              scale: 1.012,
                              transition: { duration: 0.3 },
                            }
                      }
                      className={`group relative col-start-2 row-start-1 mb-8 min-w-0 md:mb-px ${
                        isLeft
                          ? "md:col-start-1 md:pr-10"
                          : "md:col-start-3 md:pl-10"
                      }`}
                    >

                      {/* Main card surface */}
                      <div className="relative isolate overflow-hidden rounded-2xl border border-sky-300/[0.14] bg-gradient-to-br from-[#1B3442]/95 via-[#142A38]/95 to-[#101F2D]/95 p-6 shadow-[0_15px_55px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all duration-500 group-hover:border-emerald-300/45 group-hover:shadow-[0_20px_65px_rgba(16,185,129,0.15)] sm:p-7">

                        {/* Internal emerald glow */}
                        <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-64 w-64 rounded-full bg-emerald-400/[0.055] blur-[80px] transition-all duration-700 group-hover:bg-emerald-400/[0.16]" />

                        {/* Internal cyan glow */}
                        <div className="pointer-events-none absolute -bottom-28 -left-24 -z-10 h-64 w-64 rounded-full bg-sky-400/[0.045] blur-[85px] transition-all duration-700 group-hover:bg-sky-400/[0.12]" />

                        {/* Animated top border */}
                        <div className="absolute left-0 top-0 h-[2px] w-0 bg-gradient-to-r from-emerald-300 via-cyan-300 to-transparent transition-all duration-700 group-hover:w-full" />

                        {/* Top-right decorative detail */}
                        <div className="pointer-events-none absolute right-5 top-5 text-sky-200/[0.08] transition-all duration-500 group-hover:rotate-12 group-hover:text-emerald-200/20">
                          <Code2 size={55} strokeWidth={1} />
                        </div>

                        {/* Company information */}
                        <div className="relative flex items-start gap-4">

                          {/* Company logo */}
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-sky-300/20 bg-[#0B1723] shadow-inner transition-all duration-500 group-hover:border-emerald-300/50 group-hover:shadow-[0_0_25px_rgba(52,211,153,0.16)]">
                            {experience.companyLogo ? (
                              <img
                                src={experience.companyLogo}
                                alt={`${experience.company} logo`}
                                className="h-full w-full object-contain p-2"
                              />
                            ) : (
                              <BriefcaseBusiness
                                size={23}
                                className="text-emerald-300"
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">

                            {/* Employment badges */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-200">
                                {formatEmploymentType(experience.employmentType)}
                              </span>

                              {experience.isCurrentlyWorking && (
                                <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                                  <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                                  </span>
                                  Currently working
                                </span>
                              )}
                            </div>

                            {/* Position */}
                            <h3 className="mt-3 text-xl font-bold leading-tight text-[#F5F5F0] transition-colors duration-300 group-hover:text-emerald-300 sm:text-2xl">
                              {experience.position}
                            </h3>

                            {/* Company */}
                            <p className="mt-1 font-medium text-cyan-200/90 transition-colors duration-300 group-hover:text-cyan-200">
                              {experience.company}
                            </p>
                          </div>
                        </div>

                        {/* Date and location */}
                        <div className="relative mt-6 flex flex-wrap gap-x-5 gap-y-2 border-y border-sky-200/[0.09] py-3 text-xs text-slate-400">

                          <span className="flex items-center gap-2">
                            <CalendarDays
                              size={14}
                              className="text-emerald-300"
                            />
                            {formatDate(experience.startDate)} —{" "}
                            {experience.isCurrentlyWorking
                              ? "Present"
                              : experience.endDate
                                ? formatDate(experience.endDate)
                                : "Not specified"}
                          </span>

                          {experience.location && (
                            <span className="flex items-center gap-2">
                              <MapPin
                                size={14}
                                className="text-cyan-300"
                              />
                              {experience.location}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        {experience.description && (
                          <p className="relative mt-5 text-sm leading-7 text-slate-300/90">
                            {experience.description}
                          </p>
                        )}

                        {/* Highlights */}
                        {experience.highlights?.length > 0 && (
                          <div className="relative mt-6">

                            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300/90">
                              Key contributions
                            </p>

                            <ul className="space-y-3">
                              {[...experience.highlights]
                                .sort(
                                  (a, b) => a.sortOrder - b.sortOrder
                                )
                                .map((highlight, highlightIndex) => (
                                  <motion.li
                                    key={highlight.id}
                                    initial={
                                      prefersReducedMotion
                                        ? false
                                        : {
                                            opacity: 0,
                                            x: -10,
                                          }
                                    }
                                    whileInView={{
                                      opacity: 1,
                                      x: 0,
                                    }}
                                    viewport={{ once: true }}
                                    transition={{
                                      delay: prefersReducedMotion
                                        ? 0
                                        : 0.1 * highlightIndex,
                                      duration: 0.4,
                                    }}
                                    className="flex items-start gap-3 text-sm leading-6 text-slate-200/90"
                                  >
                                    <CircleDot
                                      size={15}
                                      className="mt-1 shrink-0 text-emerald-300"
                                    />
                                    <span>{highlight.content}</span>
                                  </motion.li>
                                ))}
                            </ul>
                          </div>
                        )}

                        {/* Bottom detail */}
                        <div className="relative mt-6 flex items-center justify-between border-t border-sky-200/[0.09] pt-4">

                          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Experience {String(index + 1).padStart(2, "0")}
                          </span>

                          <ArrowUpRight
                            size={18}
                            className="text-cyan-300/50 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-emerald-300"
                          />
                        </div>
                      </div>
                    </motion.article>
                  </div>
                );
              })}
            </div>

            {/* Timeline ending */}
            <div className="absolute -bottom-3 left-4 z-10 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-emerald-300/60 bg-[#0D1B28] shadow-[0_0_18px_rgba(52,211,153,0.5)] md:left-1/2" />
          </div>
        )}
      </div>
    </section>
  );
}
