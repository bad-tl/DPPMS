
"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  FaFacebookF,
  FaGithub,
  FaGlobe,
  FaInstagram,
  FaLinkedin,
  FaTelegram,
  FaTwitter,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import type { IconType } from "react-icons";

type ContactProfile = {
  intro: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
};

type SocialLink = {
  id: string;
  platform: string;
  label: string;
  url: string;
};

type ContactApiResponse = {
  profile?: ContactProfile | null;
  socialLinks?: SocialLink[];
  error?: string;
};

type MessageForm = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const EMPTY_FORM: MessageForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const SOCIAL_ICONS: Record<string, IconType> = {
  github: FaGithub,
  linkedin: FaLinkedin,
  instagram: FaInstagram,
  telegram: FaTelegram,
  facebook: FaFacebookF,
  youtube: FaYoutube,
  x: FaTwitter,
  twitter: FaTwitter,
  whatsapp: FaWhatsapp,
  website: FaGlobe,
  other: FaGlobe,
};

function ContactDetail({
  icon: Icon,
  title,
  value,
  href,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="group flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-300/10 bg-emerald-300/[0.08] text-emerald-300 transition-all duration-300 group-hover:border-emerald-300/30 group-hover:bg-emerald-300/[0.14]">
        <Icon size={16} strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          {title}
        </p>

        <p className="break-words text-xs font-medium leading-5 text-slate-100 transition-colors group-hover:text-emerald-200 sm:text-[13px]">
          {value}
        </p>
      </div>

      {href && (
        <ArrowUpRight
          size={14}
          className="shrink-0 text-slate-500 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-300"
        />
      )}
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#14251F]"
      >
        {content}
      </a>
    );
  }

  return content;
}

const inputClass =
  "w-full rounded-lg border border-white/[0.10] bg-[#0D1B29] px-3 py-2.5 text-xs text-white outline-none transition-all placeholder:text-slate-500 hover:border-white/20 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/[0.08]";

const labelClass =
  "mb-1.5 block text-[11px] font-medium text-slate-200";

export default function PublicContact() {
  const prefersReducedMotion = useReducedMotion();

  const [profile, setProfile] = useState<ContactProfile | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<MessageForm>(EMPTY_FORM);
  const [website, setWebsite] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadContact() {
      try {
        const response = await fetch("/api/contact/public", {
          cache: "no-store",
        });

        const result: ContactApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Unable to load contact details.",
          );
        }

        if (!cancelled) {
          setProfile(result.profile ?? null);
          setSocialLinks(result.socialLinks ?? []);
        }
      } catch (error) {
        console.error("Contact information loading error:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadContact();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateField(field: keyof MessageForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (feedback) {
      setFeedback(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/contact/public", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
body: JSON.stringify({
  ...form,
  extraCheck: website,
}),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to send your message. Please try again.",
        );
      }

      setFeedback({
        type: "success",
        message:
          result.message || "Your message has been sent successfully!",
      });

      setForm(EMPTY_FORM);
      setWebsite("");
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSending(false);
    }
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  const cardInitial = prefersReducedMotion ? false : "hidden";
  const cardVisible = prefersReducedMotion ? undefined : "visible";

  const phoneHref = profile?.phone
    ? `tel:${profile.phone.replace(/[^\d+]/g, "")}`
    : undefined;

  const emailHref = profile?.email
    ? `mailto:${profile.email}`
    : undefined;

  return (
    <section
      id="contact"
      className="relative isolate overflow-hidden bg-[#080F1C] px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
    >
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-10 h-[350px] w-[350px] rounded-full bg-emerald-500/[0.08] blur-[120px]" />

        <div className="absolute -right-40 bottom-0 h-[350px] w-[350px] rounded-full bg-cyan-500/[0.06] blur-[120px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Compact section heading */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-9 text-center"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Get in touch
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-[#F5F5F0] sm:text-3xl lg:text-4xl">
            Let&apos;s start a{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-cyan-300 bg-clip-text text-transparent">
              conversation.
            </span>
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-xs leading-6 text-slate-400 sm:text-sm">
            Have a project, an opportunity, or just want to connect? I&apos;d
            love to hear from you.
          </p>
        </motion.div>

        {/* Two compact contact cards */}
        <div className="grid items-stretch gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-6">
          {/* LEFT CARD */}
          <motion.div
            variants={sectionVariants}
            initial={cardInitial}
            whileInView={cardVisible}
            viewport={{ once: true, amount: 0.15 }}
            className="relative overflow-hidden rounded-2xl border border-emerald-300/[0.12] bg-[#14251F] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.22)] sm:p-6"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-emerald-400/[0.07] blur-3xl" />

            <div className="relative">
              <div className="mb-5">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-emerald-300">
                  Contact information
                </p>

                <h3 className="text-xl font-bold text-[#F5F5F0] sm:text-2xl">
                  Let&apos;s connect.
                </h3>

                <p className="mt-2 max-w-md text-xs leading-5 text-slate-400">
                  {loading
                    ? "Loading contact information..."
                    : profile?.intro ||
                      "Feel free to contact me. I'm always happy to discuss new opportunities."}
                </p>
              </div>

              {/* Vertical contact details */}
              <div className="space-y-4">
                {profile?.email && (
                  <ContactDetail
                    icon={Mail}
                    title="Email"
                    value={profile.email}
                    href={emailHref}
                  />
                )}

                {profile?.phone && (
                  <ContactDetail
                    icon={Phone}
                    title="Phone"
                    value={profile.phone}
                    href={phoneHref}
                  />
                )}

                {profile?.address && (
                  <ContactDetail
                    icon={MapPin}
                    title="Location"
                    value={profile.address}
                  />
                )}

                {profile?.workingHours && (
                  <ContactDetail
                    icon={Clock3}
                    title="Working hours"
                    value={profile.workingHours}
                  />
                )}

                {!loading &&
                  !profile?.email &&
                  !profile?.phone &&
                  !profile?.address &&
                  !profile?.workingHours && (
                    <p className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-400">
                      Contact details will be available here soon.
                    </p>
                  )}
              </div>

              {/* Social icons */}
              {socialLinks.length > 0 && (
                <div className="mt-6 border-t border-white/[0.09] pt-5">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Connect with me
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {socialLinks.map((link) => {
                      const Icon =
                        SOCIAL_ICONS[link.platform.toLowerCase()] || FaGlobe;

                      return (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={link.label || link.platform}
                          title={link.label || link.platform}
                          className="group flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.09] bg-white/[0.04] text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300/40 hover:bg-emerald-300/[0.12] hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                        >
                          <Icon size={16} />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* RIGHT CARD */}
          <motion.div
            variants={sectionVariants}
            initial={cardInitial}
            whileInView={cardVisible}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              delay: prefersReducedMotion ? 0 : 0.1,
            }}
            className="relative overflow-hidden rounded-2xl border border-cyan-300/[0.12] bg-[#142334] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.24)] sm:p-6"
          >
            <div className="pointer-events-none absolute -bottom-24 -right-20 h-60 w-60 rounded-full bg-cyan-400/[0.06] blur-3xl" />

            <div className="relative">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.08] text-cyan-300">
                  <Send size={17} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#F5F5F0] sm:text-xl">
                    Send me a message
                  </h3>

                  <p className="mt-1 text-[11px] leading-5 text-slate-400">
                    I&apos;d love to hear from you.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Hidden honeypot field */}
                <div
                  className="absolute -left-[10000px] h-px w-px overflow-hidden"
                  aria-hidden="true"
                >
                  <label htmlFor="contact-website">Website</label>

<input
  id="contact-extra-check"
  name="extraCheck"
  type="text"
  tabIndex={-1}
  autoComplete="new-password"
  value={website}
  onChange={(event) => setWebsite(event.target.value)}
/>
                </div>

                {/* Name and email */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className={labelClass}>
                      Your name <span className="text-emerald-300">*</span>
                    </label>

                    <input
                      id="contact-name"
                      type="text"
                      required
                      minLength={2}
                      maxLength={100}
                      autoComplete="name"
                      placeholder="Enter your name"
                      value={form.name}
                      onChange={(event) =>
                        updateField("name", event.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className={labelClass}>
                      Email address{" "}
                      <span className="text-emerald-300">*</span>
                    </label>

                    <input
                      id="contact-email"
                      type="email"
                      required
                      maxLength={254}
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="contact-subject" className={labelClass}>
                    Subject <span className="text-emerald-300">*</span>
                  </label>

                  <input
                    id="contact-subject"
                    type="text"
                    required
                    minLength={3}
                    maxLength={150}
                    placeholder="What would you like to discuss?"
                    value={form.subject}
                    onChange={(event) =>
                      updateField("subject", event.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="contact-message" className={labelClass}>
                    Your message <span className="text-emerald-300">*</span>
                  </label>

                  <textarea
                    id="contact-message"
                    required
                    minLength={10}
                    maxLength={5000}
                    rows={4}
                    placeholder="Write your message here..."
                    value={form.message}
                    onChange={(event) =>
                      updateField("message", event.target.value)
                    }
                    className={`${inputClass} min-h-[105px] resize-y leading-5`}
                  />

                  <p className="mt-1 text-right text-[10px] text-slate-500">
                    {form.message.length}/5000
                  </p>
                </div>

                {/* Feedback */}
                {feedback && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`flex items-start gap-2 rounded-lg border p-2.5 text-xs ${
                      feedback.type === "success"
                        ? "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-200"
                        : "border-red-400/20 bg-red-400/[0.07] text-red-200"
                    }`}
                  >
                    {feedback.type === "success" ? (
                      <CheckCircle2
                        className="mt-0.5 shrink-0"
                        size={15}
                      />
                    ) : (
                      <Mail className="mt-0.5 shrink-0" size={15} />
                    )}

                    <span>{feedback.message}</span>
                  </div>
                )}

                {/* Compact submit button */}
                <button
                  type="submit"
                  disabled={isSending}
                  className="group flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 to-emerald-300 px-4 py-3 text-xs font-bold text-[#062C20] shadow-[0_6px_20px_rgba(52,211,153,0.13)] transition-all duration-300 hover:-translate-y-0.5 hover:from-emerald-300 hover:to-cyan-300 hover:shadow-[0_9px_25px_rgba(52,211,153,0.2)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isSending ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send message
                      <ArrowUpRight
                        size={15}
                        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </>
                  )}
                </button>

                <p className="text-center text-[10px] leading-4 text-slate-500">
                  Your information will only be used to respond to your
                  message.
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
