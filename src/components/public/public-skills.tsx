
"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Braces,
  Code2,
  Database,
  Layers3,
  Sparkles,
  Wrench,
} from "lucide-react";

type Skill = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  proficiency: number;
  sortOrder: number;
  icon: string | null;
};

const categoryIcons: Record<string, typeof Code2> = {
  PROGRAMMING_LANGUAGES: Code2,
  FRAMEWORKS: Layers3,
  DATABASES: Database,
  TOOLS_AND_PLATFORMS: Wrench,
  TECHNICAL: Braces,
  PROBLEM_SOLVING: Sparkles,
  SOFT_SKILLS: Sparkles,
  OTHER: Code2,
};

const getSkillColor = (proficiency: number) => {
  if (proficiency <= 20) return "#EF4444"; // Beginner — red
  if (proficiency <= 40) return "#F97316"; // Developing — orange
  if (proficiency <= 70) return "#EAB308"; // Good — yellow
  if (proficiency <= 90) return "#34D399"; // Very good — lime
  return "#34D399"; // Excellent — emerald green
};

export default function PublicSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let mounted = true;

    async function loadSkills() {
      try {
        const response = await fetch("/api/skills/public", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Skills request failed");
        }

        const data: { skills: Skill[] } = await response.json();

        if (mounted) {
          setSkills(data.skills);
          setError(false);
        }
      } catch {
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadSkills();

    return () => {
      mounted = false;
    };
  }, []);

  if (!loading && !error && skills.length === 0) return null;

  return (
    <section
      id="skills"
      aria-labelledby="skills-title"
      className="relative isolate overflow-hidden bg-[#101713] px-4 pt-8 pb-16 text-[#F5F5F0] sm:px-6 sm:pt-10 sm:pb-20 md:px-8 lg:px-12 lg:pt-4 lg:pb-0"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-0 -z-10 h-80 w-80 rounded-full bg-emerald-400/[0.07] blur-[100px] sm:h-[28rem] sm:w-[28rem]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-40 -z-10 h-80 w-80 rounded-full bg-emerald-950/40 blur-[100px]"
      />

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: reduceMotion ? 0 : 0.6,
            ease: "easeOut",
          }}
          className="mb-10 max-w-3xl sm:mb-14 lg:mb-16"
        >
          <div className="mb-5 flex items-center gap-3 sm:mb-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#34D399] sm:text-xs">
              What I work with
            </span>
            <span className="h-px w-9 bg-[#34D399]" />
          </div>

        <h2
  id="skills-title"
  className="text-[clamp(2.2rem,6vw,4.5rem)] font-medium leading-[1.3] tracking-[-0.045em]"
  aria-label="Skills & Expertise."
>
  {"Skills & ".split("").map((char, index) => (
    <motion.span
      key={`skills-${index}`}
      aria-hidden="true"
      className="inline-block"
      animate={
        reduceMotion
          ? undefined
          : {
              y: [0, 7, 0, -4, 0],
              color: [
                "#F5F5F0",
                "#34D399",
                "#6EE7B7",
                "#F5F5F0",
              ],
            }
      }
      transition={{
        duration: 1.4,
        repeat: Infinity,
        repeatDelay: 0.1,
        delay: index * 0.07,
        ease: "easeInOut",
      }}
    >
      {char === " " ? "\u00A0" : char}
    </motion.span>
  ))}

  {"Expertise.".split("").map((char, index) => (
    <motion.span
      key={`expertise-${index}`}
      aria-hidden="true"
      className="inline-block font-serif italic"
      animate={
        reduceMotion
          ? undefined
          : {
              y: [0, 7, 0, -4, 0],
              color: [
                "#34D399",
                "#A7F3D0",
                "#F5F5F0",
                "#34D399",
              ],
            }
      }
      transition={{
        duration: 1.4,
        repeat: Infinity,
        repeatDelay: 0.1,
        delay: (index + 8) * 0.07,
        ease: "easeInOut",
      }}
    >
      {char}
    </motion.span>
  ))}
</h2>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#A7B3AA] sm:mt-6 sm:text-base sm:leading-8">
            Technologies, tools, and strengths I use to turn ideas into
            thoughtful, reliable solutions.
          </p>
        </motion.div>

        {loading ? (
          <div
            className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 sm:gap-y-10"
            aria-busy="true"
            aria-label="Loading skills"
          >
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="animate-pulse space-y-4">
                <div className="h-10 rounded-lg bg-white/[0.04]" />
                <div className="h-1 rounded-full bg-white/[0.06]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p
            role="status"
            className="rounded-xl border border-white/10 bg-white/[0.025] p-5 text-sm text-[#A7B3AA]"
          >
            Skills are temporarily unavailable. Please try again later.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 lg:gap-x-16 lg:gap-y-12">
            {skills.map((skill, index) => {
              const Icon = categoryIcons[skill.category] ?? Code2;
              const proficiency = Math.min(
                100,
                Math.max(0, skill.proficiency),
              );

              return (
                <motion.article
                  key={skill.id}
                  initial={
                    reduceMotion ? false : { opacity: 0, y: 18 }
                  }
                  whileInView={
                    reduceMotion ? undefined : { opacity: 1, y: 0 }
                  }
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.5,
                    delay: reduceMotion ? 0 : Math.min(index * 0.06, 0.3),
                    ease: "easeOut",
                  }}
                  className="group min-w-0"
                >
                  <div className="mb-4 flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#34D399]/15 bg-[#1D2B22] text-[#6EE7B7] transition duration-300 group-hover:border-[#34D399]/45 group-hover:bg-[#22382B] sm:h-11 sm:w-11">
                      {skill.icon ? (
                        <img
                          src={skill.icon}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-contain p-1.5"
                        />
                      ) : (
                        <Icon
                          aria-hidden="true"
                          className="h-5 w-5 sm:h-[22px] sm:w-[22px]"
                          strokeWidth={1.5}
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-sm font-semibold tracking-tight text-[#F5F5F0] transition-colors duration-300 group-hover:text-[#6EE7B7] sm:text-base">
                        {skill.name}
                      </h3>

                      {skill.description && (
                        <p className="mt-1 line-clamp-2 break-words text-xs leading-5 text-[#A7B3AA] sm:text-sm">
                          {skill.description}
                        </p>
                      )}
                    </div>

                    <span className="shrink-0 text-sm font-medium tabular-nums text-[#6EE7B7]">
                      {proficiency}%
                    </span>
                  </div>

                  <div
                    role="progressbar"
                    aria-label={`${skill.name} proficiency`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={proficiency}
                    className="h-[15px] overflow-hidden rounded-full bg-[#29382F]"
                  >
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: proficiency / 100 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{
                        duration: reduceMotion ? 0 : 1.1,
                        delay: reduceMotion ? 0 : Math.min(index * 0.07, 0.35),
                        ease: [0.22, 1, 0.36, 1],
                      }}
style={{
  originX: 0,
  background: getSkillColor(proficiency),
}}
                      className="h-full w-full rounded-full"
                    />
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: reduceMotion ? 0 : 0.5 }}
          className="mt-10 flex flex-wrap items-center gap-3 border-t border-white/[0.08] pt-5 sm:mt-14 sm:pt-6"
        >
        </motion.div>
      </div>
    </section>
  );
}
