
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Code2,
  ExternalLink,
  Image as ImageIcon,
  Layers3,
  X,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";

type ProjectImage = {
  id: string;
  imageUrl: string;
  alt: string | null;
  sortOrder: number;
};

type ProjectHighlight = {
  id: string;
  content: string;
  sortOrder: number;
};

type Project = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  role: string | null;
  category: string | null;
  technologies: string[];
  liveUrl: string | null;
  sourceCodeUrl: string | null;
  caseStudyUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  status: "COMPLETED" | "IN_PROGRESS" | "PLANNED";
  coverImage: string | null;
  isFeatured: boolean;
  sortOrder: number;
  images: ProjectImage[];
  highlights: ProjectHighlight[];
};

const formatDate = (date: string | null) => {
  if (!date) return null;

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

const getPeriod = (project: Project) => {
  const start = formatDate(project.startDate);
  const end = formatDate(project.endDate);

  if (start && end) return `${start} — ${end}`;

  if (start && project.status === "IN_PROGRESS") {
    return `${start} — Present`;
  }

  return start || end || null;
};

const statusLabel = (status: Project["status"]) => {
  switch (status) {
    case "IN_PROGRESS":
      return "In Progress";
    case "PLANNED":
      return "Planned";
    default:
      return "Completed";
  }
};

export default function PublicProjects() {
  const prefersReducedMotion = useReducedMotion();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(
    null,
  );

  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      const response = await fetch("/api/projects/public", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load projects.");
      }

      const data = await response.json();

      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load projects.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  // Close image preview with Escape.
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage]);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(
        projects
          .map((project) => project.category)
          .filter((category): category is string => Boolean(category)),
      ),
    );

    return ["All", ...unique];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === "All") return projects;

    return projects.filter(
      (project) => project.category === activeCategory,
    );
  }, [projects, activeCategory]);

  const getProjectImage = (project: Project) => {
    return (
      project.coverImage ||
      project.images?.[0]?.imageUrl ||
      null
    );
  };

  const toggleProjectDetails = (projectId: string) => {
    setExpandedProjectId((current) =>
      current === projectId ? null : projectId,
    );
  };

  const reveal = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 25 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.1 },
        transition: {
          duration: 0.55,
          ease: "easeOut" as const,
        },
      };

  return (
    <section
      id="projects"
      className="relative isolate overflow-hidden bg-[#080F1C] px-3 py-20 sm:px-5 lg:px-7 lg:py-28"
    >
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-20 h-[400px] w-[400px] rounded-full bg-emerald-500/[0.07] blur-[130px]" />

        <div className="absolute -right-40 top-[45%] h-[450px] w-[450px] rounded-full bg-sky-500/[0.07] blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)",
            backgroundSize: "55px 55px",
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#080F1C_100%)]" />
      </div>

      {/* Wider content area */}
      <div className="mx-auto w-full max-w-[1600px]">

        {/* Heading */}
        <motion.div
          {...reveal}
          className="mb-10 text-center sm:mb-12"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-4 py-2">
            <Code2 className="h-4 w-4 text-emerald-400" />

            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Here are some of my selected work
            </span>
          </div>

          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Projects I&apos;ve{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              built.
            </span>
          </h2>

          <div className="mx-auto mt-5 h-1 w-16 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
        </motion.div>

        {/* Category filters */}
        {categories.length > 1 && (
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setActiveCategory(category);
                  setExpandedProjectId(null);
                }}
                className={`rounded-full border px-4 py-2 text-xs font-medium transition-all duration-300 sm:px-5 sm:py-2.5 sm:text-sm ${
                  activeCategory === category
                    ? "border-emerald-400 bg-emerald-400 text-[#07130F] shadow-[0_0_22px_rgba(52,211,153,0.2)]"
                    : "border-white/10 bg-white/[0.035] text-slate-300 hover:border-emerald-400/40 hover:bg-emerald-400/[0.08] hover:text-emerald-300"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-[190px] animate-pulse rounded-xl border border-white/5 bg-white/[0.035] sm:h-[250px]"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-6 text-center text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredProjects.length === 0 && (
          <div className="py-16 text-center">
            <Layers3 className="mx-auto mb-4 h-10 w-10 text-slate-500" />

            <h3 className="text-lg font-semibold text-white sm:text-xl">
              No projects to display yet
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Projects will appear here when they are published.
            </p>
          </div>
        )}

        {/* Projects grid: always two columns */}
        {!loading && !error && filteredProjects.length > 0 && (
          <motion.div
            layout
            className="grid grid-cols-2 items-start gap-3 sm:gap-5 lg:gap-6"
          >
            {filteredProjects.map((project, index) => {
              const image = getProjectImage(project);
              const isExpanded = expandedProjectId === project.id;

              return (
                <motion.article
                  layout
                  key={project.id}
                  {...reveal}
                  transition={{
                    layout: { duration: 0.35 },
                    duration: 0.55,
                    delay: prefersReducedMotion ? 0 : (index % 2) * 0.07,
                  }}
                  className="group relative min-w-0"
                >
                  <div className="relative h-full overflow-hidden rounded-xl border border-white/[0.09] bg-[#122331] shadow-[0_12px_35px_rgba(0,0,0,0.2)] transition-all duration-400 hover:border-emerald-400/35 hover:shadow-[0_18px_45px_rgba(16,185,129,0.1)] sm:rounded-2xl">

                    {/* Compact project image */}
                    <div className="relative h-[105px] overflow-hidden bg-[#0D1C29] sm:h-[145px] md:h-[175px]">
                      {image ? (
                        <button
                          type="button"
                          aria-label={`View full image of ${project.title}`}
                          onClick={() =>
                            setSelectedImage({
                              src: image,
                              alt: project.title,
                            })
                          }
                          className="group/image relative block h-full w-full cursor-zoom-in text-left"
                        >
                          <img
                            src={image}
                            alt={project.title}
                            className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover/image:scale-110"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-[#122331]/70 via-transparent to-transparent" />

                          <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white opacity-100 backdrop-blur-md transition-all duration-300 sm:right-3 sm:top-3 sm:h-9 sm:w-9 sm:opacity-0 sm:group-hover/image:opacity-100">
                            <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </div>
                        </button>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Code2 className="h-8 w-8 text-emerald-400/30 sm:h-12 sm:w-12" />
                        </div>
                      )}

                      {/* Featured label */}
                      {project.isFeatured && (
                        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full border border-emerald-300/30 bg-[#071B17]/90 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-emerald-300 backdrop-blur-md sm:left-3 sm:top-3 sm:gap-1.5 sm:px-3 sm:text-[10px]">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Always-visible compact title area */}
                    <div className="relative z-10 -mt-3 rounded-t-xl border-t border-white/[0.08] bg-gradient-to-br from-[#1B3442] via-[#142A38] to-[#101F2D] px-2.5 pb-3 pt-3 sm:-mt-5 sm:rounded-t-2xl sm:px-5 sm:pb-4 sm:pt-4">

                      <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-5 text-white transition-colors duration-300 group-hover:text-emerald-300 sm:min-h-0 sm:text-lg sm:leading-6 lg:text-xl">
                        {project.title}
                      </h3>

                      {/* Expand / collapse button */}
                      <button
                        type="button"
                        onClick={() => toggleProjectDetails(project.id)}
                        aria-expanded={isExpanded}
                        aria-label={
                          isExpanded
                            ? `Hide details for ${project.title}`
                            : `View details for ${project.title}`
                        }
                        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.07] px-2 py-2 text-[10px] font-semibold text-emerald-300 transition-all duration-300 hover:border-emerald-400/50 hover:bg-emerald-400/[0.14] sm:mt-4 sm:gap-2 sm:py-2.5 sm:text-xs"
                      >
                        {isExpanded ? "Show less" : "View details"}

                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform duration-300 sm:h-4 sm:w-4 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Expandable project information */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            key="project-details"
                            initial={
                              prefersReducedMotion
                                ? false
                                : { height: 0, opacity: 0 }
                            }
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-white/[0.08] pt-4">

                              {/* Category and status */}
                              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                                {project.category && (
                                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-cyan-300 sm:px-3 sm:text-[10px]">
                                    {project.category}
                                  </span>
                                )}

                                <span className="flex items-center gap-1.5 text-[9px] font-medium text-slate-400 sm:text-[10px]">
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      project.status === "COMPLETED"
                                        ? "bg-emerald-400"
                                        : project.status === "IN_PROGRESS"
                                          ? "bg-cyan-400"
                                          : "bg-amber-400"
                                    }`}
                                  />

                                  {statusLabel(project.status)}
                                </span>
                              </div>

                              {/* Description */}
                              <p className="text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">
                                {project.shortDescription ||
                                  project.description ||
                                  "A project built with purpose and creativity."}
                              </p>

                              {/* Role and period */}
                              {(project.role || getPeriod(project)) && (
                                <div className="mt-4 flex flex-col gap-2 text-[10px] text-slate-400 sm:text-xs">
                                  {project.role && (
                                    <span className="flex items-start gap-1.5">
                                      <Code2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                                      {project.role}
                                    </span>
                                  )}

                                  {getPeriod(project) && (
                                    <span className="flex items-start gap-1.5">
                                      <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
                                      {getPeriod(project)}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Technologies */}
                              {project.technologies.length > 0 && (
                                <div className="mt-4">
                                  <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                    Technologies
                                  </p>

                                  <div className="flex flex-wrap gap-1.5">
                                    {project.technologies.map((tech) => (
                                      <span
                                        key={tech}
                                        className="rounded-md border border-white/[0.09] bg-white/[0.045] px-2 py-1 text-[9px] font-medium text-slate-300 transition-colors hover:border-emerald-400/30 hover:text-emerald-300 sm:text-[10px]"
                                      >
                                        {tech}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Highlights */}
                              {project.highlights.length > 0 && (
                                <div className="mt-4 space-y-2">
                                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                    Key Highlights
                                  </p>

                                  {project.highlights.map((item) => (
                                    <p
                                      key={item.id}
                                      className="flex items-start gap-2 text-[10px] leading-5 text-slate-400 sm:text-xs"
                                    >
                                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                                      {item.content}
                                    </p>
                                  ))}
                                </div>
                              )}

                              {/* Project links */}
                              {(project.liveUrl ||
                                project.sourceCodeUrl ||
                                project.caseStudyUrl) && (
                                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/[0.08] pt-4">
                                  {project.liveUrl && (
                                    <a
                                      href={project.liveUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-400 px-2.5 py-2 text-[10px] font-bold text-[#07130F] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-300 hover:shadow-[0_5px_20px_rgba(52,211,153,0.25)] sm:px-4 sm:text-xs"
                                    >
                                      Live Demo
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  )}

                                  {project.sourceCodeUrl && (
                                    <a
                                      href={project.sourceCodeUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      aria-label={`Source code for ${project.title}`}
                                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 transition-all duration-300 hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-300 sm:h-9 sm:w-9"
                                    >
                                      <FaGithub className="h-4 w-4" />
                                    </a>
                                  )}

                                  {project.caseStudyUrl && (
                                    <a
                                      href={project.caseStudyUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-300 transition-colors hover:text-cyan-200 sm:text-xs"
                                    >
                                      Case Study
                                      <ArrowUpRight className="h-3.5 w-3.5" />
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Bottom accent */}
                    <div className="h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-emerald-400 via-cyan-400 to-transparent transition-transform duration-500 group-hover:scale-x-100" />
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Full image lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl"
            onClick={() => setSelectedImage(null)}
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              aria-label="Close image preview"
              className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>

            <motion.img
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.3 }}
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-h-[88vh] max-w-full rounded-xl object-contain shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
