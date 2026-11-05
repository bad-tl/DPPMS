"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileBadge,
  Maximize2,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

type Certificate = {
  id: string;
  title: string;
  issuer: string;
  description: string | null;
  issueDate: string;
  expirationDate: string | null;
  credentialId: string | null;
  credentialUrl: string | null;
  imageUrl: string | null;
  documentUrl: string | null;
  skills: string[];
  isVisible: boolean;
  isFeatured: boolean;
  sortOrder: number;
};

function formatDate(value: string | null) {
  if (!value) return "No expiration";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function PublicCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const prefersReducedMotion = useReducedMotion();

  const loadCertificates = useCallback(async () => {
    try {
      const response = await fetch("/api/certificates/public", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load certificates.");
      }

      const data = await response.json();

      setCertificates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load certificates:", error);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  // Featured certificates appear first.
  const orderedCertificates = useMemo(() => {
    return [...certificates].sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) {
        return Number(b.isFeatured) - Number(a.isFeatured);
      }

      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }

      return (
        new Date(b.issueDate).getTime() -
        new Date(a.issueDate).getTime()
      );
    });
  }, [certificates]);

  const selectedCertificate =
    selectedIndex !== null
      ? orderedCertificates[selectedIndex]
      : null;

  const toggleExpanded = (id: string) => {
    setExpandedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const openViewer = (index: number) => {
    setSelectedIndex(index);
  };

  const closeViewer = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const showPrevious = useCallback(() => {
    setSelectedIndex((current) => {
      if (current === null || orderedCertificates.length <= 1) {
        return current;
      }

      return (
        current - 1 + orderedCertificates.length
      ) % orderedCertificates.length;
    });
  }, [orderedCertificates.length]);

  const showNext = useCallback(() => {
    setSelectedIndex((current) => {
      if (current === null || orderedCertificates.length <= 1) {
        return current;
      }

      return (current + 1) % orderedCertificates.length;
    });
  }, [orderedCertificates.length]);

  // Keyboard navigation and modal scroll locking.
  useEffect(() => {
    if (selectedIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeViewer();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIndex, closeViewer, showPrevious, showNext]);

  const reveal = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 22 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.15 },
        transition: {
          duration: 0.6,
          ease: "easeOut" as const,
        },
      };

  return (
    <>
      <section
        id="certificates"
        className="relative overflow-hidden bg-[#080F1C] px-3 py-16 sm:px-5 sm:py-20 lg:px-6 lg:py-2"
      >
        {/* Background atmosphere */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-emerald-500/[0.07] blur-[120px]" />

          <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-cyan-500/[0.05] blur-[120px]" />

          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:54px_54px] opacity-30" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl">
          {loading && (
            <div className="flex min-h-40 items-center justify-center">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-emerald-400/20 border-t-emerald-400" />
            </div>
          )}

          {!loading && orderedCertificates.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-6 py-12 text-center">
              <Award className="mx-auto h-10 w-10 text-emerald-400/60" />

              <h3 className="mt-4 text-lg font-semibold text-white">
                Achievements coming soon
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Professional certificates and achievements will appear here.
              </p>
            </div>
          )}

          {!loading && orderedCertificates.length > 0 && (
            <div className="grid items-start gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-12">

              {/* LEFT: Professional journey */}
              <motion.div
                {...reveal}
                className="relative flex flex-col items-start lg:sticky lg:top-28"
              >
                <div className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
                  <Sparkles className="h-4 w-4" />
                  Professional journey
                </div>

                <div className="relative max-w-sm">
                  <div className="absolute -left-5 top-0 h-full w-px bg-gradient-to-b from-emerald-400/60 via-emerald-400/20 to-transparent" />

                  <motion.h2
                    initial={
                      prefersReducedMotion
                        ? false
                        : { opacity: 0, x: -15 }
                    }
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-2xl font-bold leading-relaxed text-white sm:text-3xl"
                  >
                    Certificates I achieved through the{" "}
                    <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                      journey.
                    </span>
                  </motion.h2>
                </div>

                <div className="mt-7 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300">
                    <Award className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-lg font-bold text-white">
                      {String(orderedCertificates.length).padStart(2, "0")}
                    </p>

                    <p className="text-xs text-slate-500">
                      Certificates achieved
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* RIGHT: All certificate cards */}
              <div className="relative min-w-0 space-y-4">
                {orderedCertificates.map((certificate, index) => {
                  const isExpanded = expandedIds.includes(certificate.id);

                  return (
                    <motion.div
                      key={certificate.id}
                      layout
                      initial={
                        prefersReducedMotion
                          ? false
                          : { opacity: 0, y: 20 }
                      }
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.1 }}
                      transition={{
                        duration: 0.5,
                        delay: prefersReducedMotion
                          ? 0
                          : Math.min(index * 0.06, 0.3),
                      }}
                      className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#111F2D] shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400/30 hover:shadow-xl hover:shadow-emerald-950/20"
                    >
                      {/* Certificate image */}
                      <button
                        type="button"
                        onClick={() => openViewer(index)}
                        aria-label={`View ${certificate.title} full screen`}
                        className="group/image relative flex h-[76px] w-full items-center justify-center overflow-hidden bg-[#080F1C] px-4"
                      >
                        {certificate.imageUrl ? (
                          <img
                            src={certificate.imageUrl}
                            alt={certificate.title}
                            loading="lazy"
                            className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover/image:scale-[1.04]"
                          />
                        ) : (
                          <div className="flex items-center gap-3 text-slate-500">
                            <FileBadge className="h-7 w-7 text-emerald-400/60" />

                            <span className="text-xs">
                              Certificate image unavailable
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-r from-[#080F1C]/20 via-transparent to-[#080F1C]/20 opacity-0 transition-opacity duration-300 group-hover/image:opacity-100" />

                        <div className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[#080F1C]/80 text-emerald-300 opacity-0 shadow-lg backdrop-blur transition duration-300 group-hover/image:opacity-100">
                          <Maximize2 className="h-4 w-4" />
                        </div>
                      </button>

                      {/* Compact information strip */}
                      <div className="flex min-h-[38px] items-center justify-between gap-3 border-t border-white/[0.07] bg-[#142A38] px-3 py-2.5 sm:px-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-2">
                            <h3 className="truncate text-xs font-semibold text-white sm:text-sm">
                              {certificate.title}
                            </h3>

                            {certificate.isFeatured && (
                              <span className="shrink-0 rounded-md border border-emerald-400/20 bg-emerald-400/[0.08] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-300">
                                Featured
                              </span>
                            )}
                          </div>

                          <p className="mt-0.5 truncate text-[10px] text-slate-400 sm:text-xs">
                            {certificate.description || certificate.issuer}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleExpanded(certificate.id)}
                          aria-expanded={isExpanded}
                          aria-label={
                            isExpanded
                              ? `Hide details for ${certificate.title}`
                              : `Show details for ${certificate.title}`
                          }
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300 transition duration-300 hover:border-emerald-400/50 hover:bg-emerald-400 hover:text-[#062C20]"
                        >
                          <motion.span
                            animate={{
                              rotate: isExpanded ? 180 : 0,
                            }}
                            transition={{ duration: 0.25 }}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </motion.span>
                        </button>
                      </div>

                      {/* Expandable details */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            key="details"
                            initial={
                              prefersReducedMotion
                                ? false
                                : { height: 0, opacity: 0 }
                            }
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              duration: prefersReducedMotion ? 0 : 0.35,
                              ease: "easeInOut",
                            }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-white/[0.08] bg-[#0F1E2B] p-4 sm:p-5">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                                    {certificate.issuer}
                                  </p>

                                  <h4 className="mt-2 text-base font-bold text-white">
                                    {certificate.title}
                                  </h4>
                                </div>

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300">
                                  <ShieldCheck className="h-5 w-5" />
                                </div>
                              </div>

                              {certificate.description && (
                                <p className="mt-4 text-sm leading-7 text-slate-400">
                                  {certificate.description}
                                </p>
                              )}

                              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-xs text-slate-400">
                                <span className="inline-flex items-center gap-2">
                                  <CalendarDays className="h-4 w-4 text-emerald-400" />
                                  Issued {formatDate(certificate.issueDate)}
                                </span>

                                {certificate.expirationDate && (
                                  <span className="inline-flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                                    Expires{" "}
                                    {formatDate(certificate.expirationDate)}
                                  </span>
                                )}
                              </div>

                              {certificate.credentialId && (
                                <p className="mt-4 break-all text-xs text-slate-500">
                                  Credential ID:{" "}
                                  <span className="text-slate-300">
                                    {certificate.credentialId}
                                  </span>
                                </p>
                              )}

                              {certificate.skills.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                  {certificate.skills.map((skill) => (
                                    <span
                                      key={skill}
                                      className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11px] text-slate-300 transition hover:border-emerald-400/30 hover:text-emerald-300"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {certificate.credentialUrl && (
                                <div className="mt-5 border-t border-white/[0.08] pt-4">
                                  <a
                                    href={certificate.credentialUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2.5 text-xs font-bold text-[#062C20] transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-300 hover:shadow-lg hover:shadow-emerald-400/20"
                                  >
                                    Verify credential
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Full-screen certificate viewer */}
      <AnimatePresence>
        {selectedCertificate && selectedIndex !== null && (
          <motion.div
            key="certificate-viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeViewer();
              }
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#03080D]/95 p-3 backdrop-blur-xl sm:p-6"
          >
            {/* Close */}
            <button
              type="button"
              onClick={closeViewer}
              aria-label="Close viewer"
              className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white backdrop-blur transition hover:rotate-90 hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-300 sm:right-7 sm:top-7"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Previous */}
            {orderedCertificates.length > 1 && (
              <button
                type="button"
                onClick={showPrevious}
                aria-label="Previous certificate"
                className="absolute left-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#142A38]/90 text-white shadow-xl backdrop-blur transition hover:scale-110 hover:border-emerald-400/50 hover:bg-emerald-400 hover:text-[#062C20] sm:left-6 sm:h-12 sm:w-12"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}

            {/* Next */}
            {orderedCertificates.length > 1 && (
              <button
                type="button"
                onClick={showNext}
                aria-label="Next certificate"
                className="absolute right-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#142A38]/90 text-white shadow-xl backdrop-blur transition hover:scale-110 hover:border-emerald-400/50 hover:bg-emerald-400 hover:text-[#062C20] sm:right-6 sm:h-12 sm:w-12"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            )}

            {/* Viewer content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCertificate.id}
                initial={
                  prefersReducedMotion
                    ? false
                    : { opacity: 0, scale: 0.96, y: 12 }
                }
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                role="dialog"
                aria-modal="true"
                aria-label={selectedCertificate.title}
                className="flex max-h-[85vh] w-full max-w-6xl flex-col items-center"
              >
                <div className="flex min-h-0 w-full flex-1 items-center justify-center">
                  {selectedCertificate.imageUrl ? (
                    <img
                      src={selectedCertificate.imageUrl}
                      alt={selectedCertificate.title}
                      className="max-h-[72vh] max-w-full rounded-lg object-contain shadow-2xl shadow-black/50"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-slate-500">
                      <FileBadge className="h-20 w-20 text-emerald-400/50" />
                      <p>No certificate image available.</p>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex w-full flex-col items-center gap-3 text-center">
                  <div>
                    <h3 className="text-base font-semibold text-white sm:text-lg">
                      {selectedCertificate.title}
                    </h3>

                    <p className="mt-1 text-sm text-emerald-300">
                      {selectedCertificate.issuer}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
                    <span>
                      {formatDate(selectedCertificate.issueDate)}
                    </span>

                    {selectedCertificate.credentialId && (
                      <span>
                        ID: {selectedCertificate.credentialId}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-5">
                    <span className="text-xs font-medium text-slate-500">
                      {String(selectedIndex + 1).padStart(2, "0")} /{" "}
                      {String(orderedCertificates.length).padStart(2, "0")}
                    </span>

                    {selectedCertificate.credentialUrl && (
                      <a
                        href={selectedCertificate.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-300 transition hover:text-white"
                      >
                        Verify credential
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}