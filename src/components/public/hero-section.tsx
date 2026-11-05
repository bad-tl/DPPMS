
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Code2,
  Download,
  Mail,
  Sparkles,
} from "lucide-react";


import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaTelegram,
  FaFacebookF,
  FaInstagram,
} from "react-icons/fa";
type HeroData = {
  id: string;
  fullName: string;
  professionalTitle: string;
  headline: string;
  description: string;
  profileImage: string | null;
  profileImagePublicId: string | null;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
};

const socialLinks = [
  { label: "GitHub", href: "https://github.com/bad-tl", icon: FaGithub },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/tolosa-mosisa-38062835b/", icon: FaLinkedin },
  { label: "Telegram", href: "https://t.me/bad_tll", icon: FaTelegram },
  { label: "Facebook", href: "https://www.facebook.com/Tolesa", icon: FaFacebookF },
  { label: "Instagram", href: "https://www.instagram.com/tolesa_mss/", icon: FaInstagram },
  { label: "Email", href: "mailto:", icon: FaEnvelope },
];

export function HeroSection() {
  const [hero, setHero] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const controller = new AbortController();

    async function loadHero() {
      try {
        const response = await fetch("/api/hero", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load hero data");
        }

        const data: { hero: HeroData | null } = await response.json();
        setHero(data.hero);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setFailed(true);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadHero();

    return () => controller.abort();
  }, []);

  const enter = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.7, ease: "easeOut" as const },
      };

  if (loading) {
    return (
      <section
        id="home"
        aria-label="Loading portfolio introduction"
        className="min-h-[calc(100svh-76px)] animate-pulse bg-[#101713]"
      />
    );
  }

  if (failed || !hero) {
    return (
      <section
        id="home"
        className="flex min-h-[calc(100svh-76px)] items-center justify-center bg-[#101713] px-6 text-center text-[#A7B3AA]"
      >
        <p>
          {failed
            ? "Unable to load portfolio information. Please try again later."
            : "The portfolio introduction has not been configured yet."}
        </p>
      </section>
    );
  }

  return (
    <section
      id="home"
      className="relative isolate flex min-h-[calc(100svh-76px)] scroll-mt-20 items-center overflow-hidden bg-[#101713] text-[#F5F7F5]"
    >
      {/* Atmospheric background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-40 top-20 size-[420px] rounded-full bg-[#062C20]/60 blur-[120px]" />
        <div className="absolute -right-20 top-10 size-[420px] rounded-full bg-[#34D399]/[0.07] blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(52,211,153,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.15) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "linear-gradient(to bottom, transparent, black 35%, black 75%, transparent)",
          }}
        />

        {!reduceMotion && (
          <>
            <motion.div
              className="absolute left-[8%] top-[24%] size-2 rounded-full bg-[#34D399] shadow-[0_0_20px_5px_rgba(52,211,153,0.45)]"
              animate={{ y: [0, -18, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute right-[12%] top-[22%] size-3 rounded-full bg-[#6EE7B7] shadow-[0_0_25px_6px_rgba(110,231,183,0.35)]"
              animate={{ y: [0, 22, 0], x: [0, -8, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-[24%] left-[43%] size-1.5 rounded-full bg-[#34D399]"
              animate={{ y: [0, -28, 0], opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        )}

        <div className="absolute -bottom-40 left-1/2 h-72 w-[120%] -translate-x-1/2 rounded-[50%] border border-[#34D399]/10 bg-[#062C20]/10 blur-3xl" />
      </div>

      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-3 px-5 py-8 sm:gap-6 sm:px-8 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-12 lg:py-14 xl:px-16">
        {/* Mobile introduction: appears before the profile image */}
<div className="order-1 min-w-0 lg:hidden">
  <motion.div {...enter} transition={{ duration: 0.7, delay: 0.1 }}>
    <h1 className="flex flex-wrap items-baseline gap-x-2 gap-y-2 break-words text-2xl font-extrabold leading-tight tracking-[-0.035em] sm:text-3xl">
      <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#34D399]/40 bg-[#17221B] px-3 py-1.5 text-base font-semibold tracking-normal text-[#34D399] shadow-[0_0_22px_rgba(52,211,153,0.12)]">
        <span className="relative flex size-2.5">
          <motion.span
            aria-hidden="true"
            className="absolute inline-flex size-full rounded-full bg-[#34D399]"
            animate={
              reduceMotion
                ? undefined
                : { scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <span className="relative inline-flex size-2.5 rounded-full bg-[#34D399]" />
        </span>
        Hello, I&apos;m
        <Sparkles size={16} className="text-[#6EE7B7]" />
      </span>

      <span>{hero.fullName}</span>
    </h1>

    <p className="mt-2 break-words bg-gradient-to-r from-[#34D399] via-[#6EE7B7] to-[#34D399] bg-clip-text text-xl font-bold leading-tight tracking-[-0.025em] text-transparent sm:text-2xl">
      {hero.professionalTitle}
    </p>
  </motion.div>
</div>
        {/* Left: Admin-managed content */}
        <div className="relative z-10 order-3 min-w-0 lg:order-1">
<motion.div
  {...enter}
  transition={{ duration: 0.7, delay: 0.1 }}
  className="hidden lg:block"
>
  <h1 className="flex flex-wrap items-baseline gap-x-3 gap-y-2 break-words text-2xl font-extrabold leading-tight tracking-[-0.035em] sm:text-3xl md:text-4xl xl:text-5xl">
    <motion.span
      initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
      className="mb-1 inline-flex shrink-0 items-center gap-2 rounded-full border border-[#34D399]/40 bg-[#17221B] px-3 py-1.5 text-base font-semibold tracking-normal text-[#34D399] shadow-[0_0_22px_rgba(52,211,153,0.12)] sm:text-lg md:text-xl"
    >
      <span className="relative flex size-2.5">
        <motion.span
          aria-hidden="true"
          className="absolute inline-flex size-full rounded-full bg-[#34D399]"
          animate={reduceMotion ? undefined : { scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="relative inline-flex size-2.5 rounded-full bg-[#34D399]" />
      </span>
      Hello, I&apos;m
      <Sparkles size={16} className="text-[#6EE7B7] sm:size-[18px]" />
    </motion.span>

    <motion.span
      initial={reduceMotion ? false : { opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
    >
      {hero.fullName}
    </motion.span>
  </h1>

  <p className="mt-3 max-w-3xl break-words bg-gradient-to-r from-[#34D399] via-[#6EE7B7] to-[#34D399] bg-clip-text text-xl font-bold leading-tight tracking-[-0.025em] text-transparent sm:text-2xl md:text-3xl xl:text-4xl">
    {hero.professionalTitle}
  </p>
</motion.div>

          <motion.div
            {...enter}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-7 max-w-2xl"
          >
            <h2 className="text-lg font-semibold leading-relaxed text-[#D2DED5] sm:text-xl">
              {hero.headline}
            </h2>

            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#A7B3AA] sm:text-base sm:leading-8">
              {hero.description}
            </p>
          </motion.div>

          {/* Primary and secondary admin-managed buttons */}
          <motion.div
            {...enter}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9 flex flex-col gap-4 sm:flex-row sm:flex-wrap"
          >
            {hero.primaryButtonText && hero.primaryButtonLink && (
              <Link
                href={hero.primaryButtonLink}
                className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#34D399] px-7 py-3.5 text-sm font-bold text-[#101713] shadow-[0_0_30px_rgba(52,211,153,0.16)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#6EE7B7] hover:shadow-[0_0_38px_rgba(52,211,153,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6EE7B7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101713]"
              >
                <Code2 size={19} />
                <span>{hero.primaryButtonText}</span>
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            )}

            {hero.secondaryButtonText && hero.secondaryButtonLink && (
              <Link
                href={hero.secondaryButtonLink}
                className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-[#34D399]/70 bg-[#101713]/50 px-7 py-3.5 text-sm font-semibold text-[#F5F7F5] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#6EE7B7] hover:bg-[#17221B] hover:text-[#6EE7B7] hover:shadow-[0_0_25px_rgba(52,211,153,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34D399] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101713]"
              >
                <Download
                  size={19}
                  className="text-[#34D399] transition-transform duration-300 group-hover:-translate-y-0.5"
                />
                <span>{hero.secondaryButtonText}</span>
                <ArrowUpRight
                  size={16}
                  className="opacity-60 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
            )}
          </motion.div>

          {/* Social links: replace placeholder destinations later */}
          <motion.div
            {...enter}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-8 flex items-center gap-3"
            aria-label="Social media links"
          >
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                title={label}
                className="group flex size-12 items-center justify-center rounded-xl border border-[#29382F] bg-[#17221B]/70 text-[#D2DED5] transition-all duration-300 hover:-translate-y-1 hover:border-[#34D399]/70 hover:bg-[#34D399]/10 hover:text-[#6EE7B7] hover:shadow-[0_8px_24px_rgba(52,211,153,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34D399]"
              >
<Icon
  size={20}
  aria-hidden="true"
  className="transition-transform duration-300 group-hover:scale-110"
/>
              </a>
            ))}
          </motion.div>
        </div>

        {/* Right: Circular profile image */}
        <motion.div
  initial={reduceMotion ? false : { opacity: 0, scale: 0.94, x: 24 }}
  animate={{ opacity: 1, scale: 1, x: 0 }}
  transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
  className="relative order-1 mx-auto -mt-4 flex w-full max-w-[460px] items-center justify-center lg:order-2 lg:-mt-16 lg:max-w-[620px] xl:-mt-20 xl:max-w-[680px]"
>
          <div className="relative aspect-square w-full">
            {/* Soft glow behind portrait */}
            <div
              aria-hidden="true"
              className="absolute inset-[12%] rounded-full bg-[#34D399]/15 blur-[65px]"
            />

            {/* Outer orbital ring */}
            <motion.div
              aria-hidden="true"
              className="absolute inset-[2%] rounded-full border border-dashed border-[#34D399]/25"
              animate={reduceMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
            >
              <span className="absolute left-[16%] top-[9%] size-3 rounded-full bg-[#34D399] shadow-[0_0_20px_5px_rgba(52,211,153,0.55)]" />
              <span className="absolute bottom-[14%] right-[5%] size-2.5 rounded-full bg-[#6EE7B7] shadow-[0_0_18px_4px_rgba(110,231,183,0.4)]" />
            </motion.div>

            {/* Inner orbit */}
            <motion.div
              aria-hidden="true"
              className="absolute inset-[8%] rounded-full border border-[#34D399]/50"
              animate={reduceMotion ? undefined : { rotate: -360 }}
              transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            >
              <span className="absolute -left-1 top-[48%] size-3.5 rounded-full bg-[#34D399] shadow-[0_0_20px_5px_rgba(52,211,153,0.45)]" />
            </motion.div>

            {/* Profile image frame */}
            <motion.div
              className="absolute inset-[10%] rounded-full p-[5px]"
              animate={
                reduceMotion
                  ? undefined
                  : {
                      boxShadow: [
                        "0 0 24px rgba(52,211,153,0.18)",
                        "0 0 48px rgba(52,211,153,0.32)",
                        "0 0 24px rgba(52,211,153,0.18)",
                      ],
                    }
              }
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                background:
                  "conic-gradient(from 0deg, #34D399, #062C20, #6EE7B7, #062C20, #34D399)",
              }}
            >
              <div className="relative h-full w-full overflow-hidden rounded-full border border-[#6EE7B7]/40 bg-[#17221B]">
                {hero.profileImage ? (
                  <Image
                    src={hero.profileImage}
                    alt={hero.fullName}
                    fill
                    priority
                    sizes="(max-width: 640px) 72vw, (max-width: 1024px) 55vw, 500px"
                    unoptimized
                   className="object-contain object-center transition-transform duration-700 hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-[#34D399]">
                    <Code2 size={64} strokeWidth={1.1} />
                    <span className="px-4 text-center text-sm text-[#A7B3AA]">
                      Add your profile image in the Hero admin panel
                    </span>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#101713]/25 to-transparent" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.a
        href="#about"
        aria-label="Scroll to explore the portfolio"
        className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[#A7B3AA] transition-colors hover:text-[#6EE7B7] sm:flex"
        animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="flex size-9 items-center justify-center rounded-full border border-[#34D399]/40">
          <ArrowDown size={17} />
        </span>
        <span className="text-[9px] font-medium uppercase tracking-[0.25em]">
          Scroll to explore
        </span>
      </motion.a>
    </section>
  );
}
