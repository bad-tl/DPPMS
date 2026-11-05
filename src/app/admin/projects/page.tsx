
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ImageUpload } from "@/components/admin/image-upload";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Code2,
  Eye,
  EyeOff,
  ExternalLink,
  FolderKanban,
  ImagePlus,
  Layers3,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { GitBranch } from "lucide-react";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

type ProjectStatus = "COMPLETED" | "IN_PROGRESS" | "PLANNED";

type ProjectImage = {
  id?: string;
  imageUrl: string;
  publicId: string;
  alt: string | null;
  sortOrder: number;
};

type ProjectHighlight = {
  id?: string;
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
  status: ProjectStatus;
  coverImage: string | null;
  coverImagePublicId: string | null;
  isFeatured: boolean;
  isVisible: boolean;
  sortOrder: number;
  images: ProjectImage[];
  highlights: ProjectHighlight[];
  createdAt: string;
  updatedAt: string;
};

type ProjectForm = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  role: string;
  category: string;
  technologies: string;
  liveUrl: string;
  sourceCodeUrl: string;
  caseStudyUrl: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  coverImage: string;
  coverImagePublicId: string;
  isFeatured: boolean;
  isVisible: boolean;
  sortOrder: number;
  highlights: string;
  images: ProjectImage[];
};

// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------

const initialForm: ProjectForm = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  role: "",
  category: "",
  technologies: "",
  liveUrl: "",
  sourceCodeUrl: "",
  caseStudyUrl: "",
  startDate: "",
  endDate: "",
  status: "COMPLETED",
  coverImage: "",
  coverImagePublicId: "",
  isFeatured: false,
  isVisible: true,
  sortOrder: 0,
  highlights: "",
  images: [],
};

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: "COMPLETED", label: "Completed" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "PLANNED", label: "Planned" },
];

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

async function readResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    throw new Error(
      `The server returned an empty response (${response.status}).`,
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Unexpected server response (${response.status}).`);
  }
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function dateInputValue(value: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

function formatDate(value: string | null) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function statusLabel(status: ProjectStatus) {
  return (
    statusOptions.find((option) => option.value === status)?.label ?? status
  );
}

function statusStyle(status: ProjectStatus) {
  switch (status) {
    case "COMPLETED":
      return "border-[#34D399]/20 bg-[#34D399]/[0.08] text-[#6EE7B7]";
    case "IN_PROGRESS":
      return "border-sky-400/20 bg-sky-400/[0.08] text-sky-300";
    case "PLANNED":
      return "border-amber-400/20 bg-amber-400/[0.08] text-amber-300";
  }
}

function toPayload(form: ProjectForm) {
  return {
    title: form.title.trim(),
    slug: form.slug.trim(),
    shortDescription: form.shortDescription.trim() || null,
    description: form.description.trim() || null,
    role: form.role.trim() || null,
    category: form.category.trim() || null,
    technologies: form.technologies
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    liveUrl: form.liveUrl.trim() || null,
    sourceCodeUrl: form.sourceCodeUrl.trim() || null,
    caseStudyUrl: form.caseStudyUrl.trim() || null,
    startDate: form.startDate
      ? new Date(`${form.startDate}T12:00:00`).toISOString()
      : null,
    endDate: form.endDate
      ? new Date(`${form.endDate}T12:00:00`).toISOString()
      : null,
    status: form.status,
    coverImage: form.coverImage || null,
    coverImagePublicId: form.coverImagePublicId || null,
    isFeatured: form.isFeatured,
    isVisible: form.isVisible,
    sortOrder: form.sortOrder,
    images: form.images.map((image, index) => ({
      imageUrl: image.imageUrl,
      publicId: image.publicId,
      alt: image.alt || null,
      sortOrder: index,
    })),
    highlights: form.highlights
      .split("\n")
      .map((content) => content.trim())
      .filter(Boolean)
      .map((content, index) => ({
        content,
        sortOrder: index,
      })),
  };
}

// --------------------------------------------------
// PAGE
// --------------------------------------------------

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<ProjectForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-[#101713] px-4 py-3 text-sm text-[#F5F5F0] outline-none transition placeholder:text-[#718075] focus:border-[#34D399]/60 focus:ring-2 focus:ring-[#34D399]/10";

  // ------------------------------------------------
  // LOAD PROJECTS
  // ------------------------------------------------

 const loadProjects = useCallback(async () => {
  try {
    const response = await fetch("/api/projects", {
      cache: "no-store",
    });

    const result = await readResponse(response);

    if (!response.ok) {
      throw new Error(result.error || "Unable to load projects.");
    }

    setProjects(Array.isArray(result) ? result : result.projects ?? []);
    setError("");
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Unable to load projects.",
    );
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => {
  const timer = requestAnimationFrame(() => {
    setLoading(true);
    void loadProjects();
  });

  return () => cancelAnimationFrame(timer);
}, [loadProjects]);
  // ------------------------------------------------
  // FILTER AND STATISTICS
  // ------------------------------------------------

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesFilter =
        filter === "ALL" ||
        (filter === "FEATURED" && project.isFeatured) ||
        (filter === "VISIBLE" && project.isVisible) ||
        project.status === filter;

      const matchesSearch =
        !query ||
        project.title.toLowerCase().includes(query) ||
        (project.category ?? "").toLowerCase().includes(query) ||
        (project.shortDescription ?? "").toLowerCase().includes(query) ||
        project.technologies.some((technology) =>
          technology.toLowerCase().includes(query),
        );

      return matchesFilter && matchesSearch;
    });
  }, [projects, search, filter]);

  const stats = useMemo(
    () => ({
      total: projects.length,
      completed: projects.filter((project) => project.status === "COMPLETED")
        .length,
      inProgress: projects.filter(
        (project) => project.status === "IN_PROGRESS",
      ).length,
      featured: projects.filter((project) => project.isFeatured).length,
    }),
    [projects],
  );

  // ------------------------------------------------
  // FORM HELPERS
  // ------------------------------------------------

  function updateForm<K extends keyof ProjectForm>(
    key: K,
    value: ProjectForm[K],
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function startCreate() {
    setEditingId(null);
    setForm({
      ...initialForm,
      sortOrder: projects.length,
    });
    setError("");
    setNotice("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function startEdit(project: Project) {
    setEditingId(project.id);

    setForm({
      title: project.title,
      slug: project.slug,
      shortDescription: project.shortDescription ?? "",
      description: project.description ?? "",
      role: project.role ?? "",
      category: project.category ?? "",
      technologies: project.technologies.join(", "),
      liveUrl: project.liveUrl ?? "",
      sourceCodeUrl: project.sourceCodeUrl ?? "",
      caseStudyUrl: project.caseStudyUrl ?? "",
      startDate: dateInputValue(project.startDate),
      endDate: dateInputValue(project.endDate),
      status: project.status,
      coverImage: project.coverImage ?? "",
      coverImagePublicId: project.coverImagePublicId ?? "",
      isFeatured: project.isFeatured,
      isVisible: project.isVisible,
      sortOrder: project.sortOrder,
      highlights: project.highlights
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((highlight) => highlight.content)
        .join("\n"),
      images: [...project.images]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((image) => ({
          id: image.id,
          imageUrl: image.imageUrl,
          publicId: image.publicId,
          alt: image.alt,
          sortOrder: image.sortOrder,
        })),
    });

    setError("");
    setNotice("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(initialForm);
  }

  // ------------------------------------------------
  // CREATE / UPDATE
  // ------------------------------------------------

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setNotice("");

    try {
      if (!form.title.trim()) {
        throw new Error("Project title is required.");
      }

      if (!form.slug.trim()) {
        throw new Error("Project slug is required.");
      }

      if (!form.coverImage || !form.coverImagePublicId) {
        throw new Error("Please upload a project cover image.");
      }

      if (
        form.startDate &&
        form.endDate &&
        new Date(form.endDate) < new Date(form.startDate)
      ) {
        throw new Error("End date cannot be before start date.");
      }

      const payload = toPayload(form);

      const response = await fetch("/api/projects", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingId ? { ...payload, id: editingId } : payload,
        ),
      });

      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(result.error || "Unable to save project.");
      }

      const wasEditing = Boolean(editingId);

      closeForm();

      setNotice(
        wasEditing
          ? "Project updated successfully."
          : "Project created successfully.",
      );

      await loadProjects();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save project.",
      );
    } finally {
      setSaving(false);
    }
  }

  // ------------------------------------------------
  // DELETE
  // ------------------------------------------------

  async function deleteProject(project: Project) {
    if (
      !window.confirm(
        `Delete "${project.title}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    setDeletingId(project.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/projects?id=${encodeURIComponent(project.id)}`,
        {
          method: "DELETE",
        },
      );

      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(result.error || "Unable to delete project.");
      }

      setNotice(`${project.title} was deleted.`);
      await loadProjects();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete project.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  // ------------------------------------------------
  // QUICK UPDATE
  // ------------------------------------------------

  async function updateProject(project: Project, changes: Partial<Project>) {
    setError("");
    setNotice("");

    try {
      const payload = {
        title: project.title,
        slug: project.slug,
        shortDescription: project.shortDescription,
        description: project.description,
        role: project.role,
        category: project.category,
        technologies: project.technologies,
        liveUrl: project.liveUrl,
        sourceCodeUrl: project.sourceCodeUrl,
        caseStudyUrl: project.caseStudyUrl,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status,
        coverImage: project.coverImage,
        coverImagePublicId: project.coverImagePublicId,
        isFeatured: project.isFeatured,
        isVisible: project.isVisible,
        sortOrder: project.sortOrder,
        images: project.images.map((image, index) => ({
          imageUrl: image.imageUrl,
          publicId: image.publicId,
          alt: image.alt,
          sortOrder: index,
        })),
        highlights: project.highlights.map((highlight, index) => ({
          content: highlight.content,
          sortOrder: index,
        })),
        ...changes,
      };

      const response = await fetch("/api/projects", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          id: project.id,
        }),
      });

      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(result.error || "Unable to update project.");
      }

      await loadProjects();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update project.",
      );
    }
  }

  async function toggleVisibility(project: Project) {
    await updateProject(project, {
      isVisible: !project.isVisible,
    });

    setNotice(
      `${project.title} is now ${
        project.isVisible ? "hidden" : "visible"
      }.`,
    );
  }

  async function toggleFeatured(project: Project) {
    await updateProject(project, {
      isFeatured: !project.isFeatured,
    });

    setNotice(
      `${project.title} ${
        project.isFeatured ? "removed from" : "marked as"
      } featured projects.`,
    );
  }

  async function moveProject(project: Project, direction: -1 | 1) {
    const ordered = [...projects].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );

    const index = ordered.findIndex((item) => item.id === project.id);
    const other = ordered[index + direction];

    if (!other) return;

    setError("");
    setNotice("");

    try {
      const responses = await Promise.all([
        updateProjectOrder(project, other.sortOrder),
        updateProjectOrder(other, project.sortOrder),
      ]);

      if (responses.some((success) => !success)) {
        throw new Error("Unable to reorder projects.");
      }

      await loadProjects();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to reorder projects.",
      );
    }
  }

  async function updateProjectOrder(project: Project, sortOrder: number) {
    const payload = {
      title: project.title,
      slug: project.slug,
      shortDescription: project.shortDescription,
      description: project.description,
      role: project.role,
      category: project.category,
      technologies: project.technologies,
      liveUrl: project.liveUrl,
      sourceCodeUrl: project.sourceCodeUrl,
      caseStudyUrl: project.caseStudyUrl,
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status,
      coverImage: project.coverImage,
      coverImagePublicId: project.coverImagePublicId,
      isFeatured: project.isFeatured,
      isVisible: project.isVisible,
      sortOrder,
      images: project.images.map((image, index) => ({
        imageUrl: image.imageUrl,
        publicId: image.publicId,
        alt: image.alt,
        sortOrder: index,
      })),
      highlights: project.highlights.map((highlight, index) => ({
        content: highlight.content,
        sortOrder: index,
      })),
    };

    const response = await fetch("/api/projects", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        id: project.id,
      }),
    });

    const result = await readResponse(response);

    if (!response.ok) {
      throw new Error(result.error || "Unable to update project order.");
    }

    return true;
  }

  // ------------------------------------------------
  // RENDER
  // ------------------------------------------------

  return (
    <div className="min-h-screen bg-[#101713] px-4 py-7 text-[#F5F5F0] sm:px-6 sm:py-9 lg:px-9">
      <div className="mx-auto max-w-7xl space-y-7">

        {/* PAGE HEADING */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#34D399]">
              <Sparkles className="h-4 w-4" />
              Portfolio management
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Projects <span className="text-[#6EE7B7]">&amp; work</span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#A7B3AA] sm:text-base">
              Showcase the applications, products, and solutions you have
              designed and developed.
            </p>
          </div>

          <button
            type="button"
            onClick={startCreate}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#34D399] px-5 py-3 text-sm font-semibold text-[#101713] transition hover:bg-[#6EE7B7] focus:outline-none focus:ring-2 focus:ring-[#6EE7B7] focus:ring-offset-2 focus:ring-offset-[#101713]"
          >
            <Plus className="h-4 w-4" />
            Add project
          </button>
        </header>

        {/* FEEDBACK */}
        {error && (
          <div
            role="alert"
            className="flex gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.07] p-4 text-sm text-red-200"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="rounded-xl border border-[#34D399]/20 bg-[#34D399]/[0.06] p-4 text-sm text-[#6EE7B7]"
          >
            {notice}
          </div>
        )}

        {/* STATISTICS */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: "Total projects",
              value: stats.total,
              icon: FolderKanban,
            },
            {
              label: "Completed",
              value: stats.completed,
              icon: CheckCircle2,
            },
            {
              label: "In progress",
              value: stats.inProgress,
              icon: BriefcaseBusiness,
            },
            {
              label: "Featured",
              value: stats.featured,
              icon: Star,
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/[0.08] bg-[#17221B]/70 p-4 sm:p-5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#34D399]/15 bg-[#34D399]/[0.06] text-[#6EE7B7]">
                  <Icon className="h-4 w-4" />
                </div>

                <p className="mt-4 text-2xl font-semibold tabular-nums sm:text-3xl">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs text-[#A7B3AA] sm:text-sm">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* CREATE / EDIT FORM */}
        {showForm && (
          <section className="overflow-hidden rounded-2xl border border-[#34D399]/20 bg-[#17221B]/80">
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] p-5 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#34D399]">
                  Project information
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  {editingId ? "Edit project" : "Create a new project"}
                </h2>

                <p className="mt-1 text-sm text-[#A7B3AA]">
                  Add the details visitors need to understand your work.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close form"
                onClick={closeForm}
                className="rounded-lg p-2 text-[#A7B3AA] transition hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7 p-5 sm:p-6">

              {/* BASIC INFORMATION */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Layers3 className="h-4 w-4 text-[#34D399]" />
                  <h3 className="text-sm font-semibold">Basic information</h3>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block text-sm font-medium">
                    Project title <span className="text-[#34D399]">*</span>
                    <input
                      required
                      maxLength={150}
                      value={form.title}
                      onChange={(event) => {
                        const title = event.target.value;

                        setForm((previous) => ({
                          ...previous,
                          title,
                          slug: editingId
                            ? previous.slug
                            : createSlug(title),
                        }));
                      }}
                      placeholder="e.g. EthioLogiTrack"
                      className={inputClass}
                    />
                  </label>

                  <label className="block text-sm font-medium">
                    URL slug <span className="text-[#34D399]">*</span>
                    <input
                      required
                      maxLength={180}
                      pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                      value={form.slug}
                      onChange={(event) =>
                        updateForm("slug", createSlug(event.target.value))
                      }
                      placeholder="ethiologitrack"
                      className={inputClass}
                    />
                    <span className="mt-1 block text-xs text-[#718075]">
                      Lowercase letters, numbers, and hyphens only.
                    </span>
                  </label>

                  <label className="block text-sm font-medium">
                    Category
                    <input
                      maxLength={100}
                      value={form.category}
                      onChange={(event) =>
                        updateForm("category", event.target.value)
                      }
                      placeholder="e.g. Web Application, Mobile App"
                      className={inputClass}
                    />
                  </label>

                  <label className="block text-sm font-medium">
                    Your role
                    <input
                      maxLength={100}
                      value={form.role}
                      onChange={(event) =>
                        updateForm("role", event.target.value)
                      }
                      placeholder="e.g. Full-stack Developer"
                      className={inputClass}
                    />
                  </label>
                </div>
              </div>

              {/* DESCRIPTIONS */}
              <div className="space-y-5">
                <label className="block text-sm font-medium">
                  Short description
                  <textarea
                    rows={2}
                    maxLength={300}
                    value={form.shortDescription}
                    onChange={(event) =>
                      updateForm("shortDescription", event.target.value)
                    }
                    placeholder="A short introduction displayed on project cards."
                    className={`${inputClass} resize-y`}
                  />
                  <span className="mt-1 block text-right text-xs text-[#718075]">
                    {form.shortDescription.length}/300
                  </span>
                </label>

                <label className="block text-sm font-medium">
                  Full description
                  <textarea
                    rows={5}
                    maxLength={5000}
                    value={form.description}
                    onChange={(event) =>
                      updateForm("description", event.target.value)
                    }
                    placeholder="Explain the problem, your solution, the architecture, and what you learned."
                    className={`${inputClass} resize-y`}
                  />
                  <span className="mt-1 block text-right text-xs text-[#718075]">
                    {form.description.length}/5000
                  </span>
                </label>
              </div>

              {/* TECHNOLOGIES */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-[#34D399]" />
                  <h3 className="text-sm font-semibold">Technologies used</h3>
                </div>

                <label className="block text-sm font-medium">
                  Technology names
                  <input
                    value={form.technologies}
                    onChange={(event) =>
                      updateForm("technologies", event.target.value)
                    }
                    placeholder="Next.js, TypeScript, Prisma, PostgreSQL"
                    className={inputClass}
                  />
                  <span className="mt-1 block text-xs text-[#718075]">
                    Separate each technology with a comma.
                  </span>
                </label>

                {form.technologies.trim() && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.technologies
                      .split(",")
                      .map((technology) => technology.trim())
                      .filter(Boolean)
                      .map((technology, index) => (
                        <span
                          key={`${technology}-${index}`}
                          className="rounded-lg border border-[#34D399]/15 bg-[#34D399]/[0.06] px-3 py-1.5 text-xs text-[#6EE7B7]"
                        >
                          {technology}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {/* PROJECT HIGHLIGHTS */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#34D399]" />
                  <h3 className="text-sm font-semibold">Project highlights</h3>
                </div>

                <label className="block text-sm font-medium">
                  Key features and contributions
                  <textarea
                    rows={5}
                    value={form.highlights}
                    onChange={(event) =>
                      updateForm("highlights", event.target.value)
                    }
                    placeholder={
                      "User authentication and authorization\nReal-time shipment tracking\nResponsive dashboard"
                    }
                    className={`${inputClass} resize-y`}
                  />
                  <span className="mt-1 block text-xs text-[#718075]">
                    Enter one highlight per line.
                  </span>
                </label>
              </div>

              {/* PROJECT LINKS */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-[#34D399]" />
                  <h3 className="text-sm font-semibold">Project links</h3>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block text-sm font-medium">
                    Live project URL
                    <input
                      type="url"
                      value={form.liveUrl}
                      onChange={(event) =>
                        updateForm("liveUrl", event.target.value)
                      }
                      placeholder="https://yourproject.com"
                      className={inputClass}
                    />
                  </label>

                  <label className="block text-sm font-medium">
                    Source code URL
                    <input
                      type="url"
                      value={form.sourceCodeUrl}
                      onChange={(event) =>
                        updateForm("sourceCodeUrl", event.target.value)
                      }
                      placeholder="https://github.com/username/project"
                      className={inputClass}
                    />
                  </label>

                  <label className="block text-sm font-medium md:col-span-2">
                    Case study URL
                    <input
                      type="url"
                      value={form.caseStudyUrl}
                      onChange={(event) =>
                        updateForm("caseStudyUrl", event.target.value)
                      }
                      placeholder="https://yourproject.com/case-study"
                      className={inputClass}
                    />
                  </label>
                </div>
              </div>

              {/* TIMELINE AND STATUS */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[#34D399]" />
                  <h3 className="text-sm font-semibold">Timeline and status</h3>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-medium">
                    Start date
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(event) =>
                        updateForm("startDate", event.target.value)
                      }
                      className={inputClass}
                    />
                  </label>

                  <label className="block text-sm font-medium">
                    End date
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(event) =>
                        updateForm("endDate", event.target.value)
                      }
                      disabled={form.status !== "COMPLETED"}
                      className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-40`}
                    />
                    <span className="mt-1 block text-xs text-[#718075]">
                      An end date is normally used for completed projects.
                    </span>
                  </label>

                  <label className="block text-sm font-medium">
                    Project status
                    <select
                      value={form.status}
                      onChange={(event) => {
                        const status = event.target.value as ProjectStatus;

                        setForm((previous) => ({
                          ...previous,
                          status,
                          endDate:
                            status === "COMPLETED"
                              ? previous.endDate
                              : "",
                        }));
                      }}
                      className={inputClass}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm font-medium">
                    Display order
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={form.sortOrder}
                      onChange={(event) =>
                        updateForm(
                          "sortOrder",
                          Math.max(0, Number(event.target.value)),
                        )
                      }
                      className={inputClass}
                    />
                  </label>
                </div>
              </div>

              {/* COVER IMAGE */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <ImagePlus className="h-4 w-4 text-[#34D399]" />
                  <h3 className="text-sm font-semibold">Project cover image</h3>
                </div>

                <ImageUpload
                  section="projects"
                  value={form.coverImage || null}
                  publicId={form.coverImagePublicId || null}
                  label="Project cover"
                  onChange={({ url, publicId }) => {
                    setForm((current) => ({
                      ...current,
                      coverImage: url ?? "",
                      coverImagePublicId: publicId ?? "",
                    }));
                  }}
                />

                <p className="mt-2 text-xs leading-5 text-[#718075]">
                  Use a high-quality screenshot or project mockup. This image
                  will represent the project in your public portfolio.
                </p>
              </div>

              {/* GALLERY IMAGES */}
              <div>
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <ImagePlus className="h-4 w-4 text-[#34D399]" />
                    <h3 className="text-sm font-semibold">Additional images</h3>
                  </div>
                  <p className="mt-1 text-xs text-[#A7B3AA]">
                    Add screenshots of different pages or features of your
                    project.
                  </p>
                </div>

                <div className="space-y-4">
                  {form.images.map((image, index) => (
                    <div
                      key={image.id ?? `new-image-${index}`}
                      className="rounded-xl border border-white/[0.08] bg-[#101713]/60 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Gallery image {index + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateForm(
                              "images",
                              form.images.filter((_, i) => i !== index),
                            )
                          }
                          className="rounded-lg p-2 text-[#A7B3AA] transition hover:bg-red-400/10 hover:text-red-300"
                          aria-label={`Remove gallery image ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <ImageUpload
                        section="projects"
                        value={image.imageUrl || null}
                        publicId={image.publicId || null}
                        label={`Gallery image ${index + 1}`}
                        onChange={({ url, publicId }) => {
                          updateForm(
                            "images",
                            form.images.map((item, i) =>
                              i === index
                                ? {
                                    ...item,
                                    imageUrl: url ?? "",
                                    publicId: publicId ?? "",
                                  }
                                : item,
                            ),
                          );
                        }}
                      />

                      <label className="mt-4 block text-sm font-medium">
                        Image description (alt text)
                        <input
                          value={image.alt ?? ""}
                          onChange={(event) =>
                            updateForm(
                              "images",
                              form.images.map((item, i) =>
                                i === index
                                  ? {
                                      ...item,
                                      alt: event.target.value,
                                    }
                                  : item,
                              ),
                            )
                          }
                          placeholder="Describe what this screenshot shows."
                          className={inputClass}
                        />
                      </label>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    updateForm("images", [
                      ...form.images,
                      {
                        imageUrl: "",
                        publicId: "",
                        alt: "",
                        sortOrder: form.images.length,
                      },
                    ])
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-dashed border-[#34D399]/30 px-4 py-3 text-sm font-medium text-[#6EE7B7] transition hover:bg-[#34D399]/[0.06]"
                >
                  <Plus className="h-4 w-4" />
                  Add gallery image
                </button>
              </div>

              {/* DISPLAY SETTINGS */}
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.08] bg-[#101713]/60 p-4">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(event) =>
                      updateForm("isFeatured", event.target.checked)
                    }
                    className="h-4 w-4 accent-[#34D399]"
                  />
                  <span>
                    <span className="block text-sm font-medium">
                      Featured project
                    </span>
                    <span className="mt-1 block text-xs text-[#A7B3AA]">
                      Give this project special prominence.
                    </span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.08] bg-[#101713]/60 p-4">
                  <input
                    type="checkbox"
                    checked={form.isVisible}
                    onChange={(event) =>
                      updateForm("isVisible", event.target.checked)
                    }
                    className="h-4 w-4 accent-[#34D399]"
                  />
                  <span>
                    <span className="block text-sm font-medium">
                      Visible publicly
                    </span>
                    <span className="mt-1 block text-xs text-[#A7B3AA]">
                      Allow visitors to see this project.
                    </span>
                  </span>
                </label>
              </div>

              {/* FORM ACTIONS */}
              <div className="flex flex-col-reverse gap-3 border-t border-white/[0.08] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-[#A7B3AA] transition hover:bg-white/[0.04] hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#34D399] px-5 py-3 text-sm font-semibold text-[#101713] transition hover:bg-[#6EE7B7] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  )}
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Create project"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* SEARCH AND FILTERS */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718075]" />
              <input
                aria-label="Search projects"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search projects, technologies, categories..."
                className="w-full rounded-xl border border-white/10 bg-[#17221B]/70 py-3 pl-10 pr-4 text-sm outline-none placeholder:text-[#718075] focus:border-[#34D399]/50"
              />
            </div>

            <select
              aria-label="Filter projects"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-xl border border-white/10 bg-[#17221B] px-4 py-3 text-sm outline-none focus:border-[#34D399]/50 sm:max-w-xs"
            >
              <option value="ALL">All projects</option>
              <option value="COMPLETED">Completed</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="PLANNED">Planned</option>
              <option value="FEATURED">Featured</option>
              <option value="VISIBLE">Publicly visible</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Your projects</h2>
            <span className="text-xs text-[#A7B3AA]">
              {filteredProjects.length}{" "}
              {filteredProjects.length === 1 ? "result" : "results"}
            </span>
          </div>
        </section>

        {/* PROJECT GRID */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/[0.08] bg-[#17221B]/50 py-16 text-sm text-[#A7B3AA]">
            <LoaderCircle className="h-5 w-5 animate-spin text-[#34D399]" />
            Loading projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-[#17221B]/30 px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#34D399]/20 bg-[#34D399]/[0.06] text-[#6EE7B7]">
              <FolderKanban className="h-7 w-7" />
            </div>

            <h3 className="mt-5 text-lg font-semibold">
              {projects.length
                ? "No matching projects"
                : "Start showcasing your work"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#A7B3AA]">
              {projects.length
                ? "Try another search term or filter."
                : "Add your applications, websites, and other projects to build your portfolio."}
            </p>

            {projects.length === 0 && (
              <button
                type="button"
                onClick={startCreate}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#34D399] px-4 py-3 text-sm font-semibold text-[#101713] hover:bg-[#6EE7B7]"
              >
                <Plus className="h-4 w-4" />
                Add your first project
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <article
                key={project.id}
                className="group min-w-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#17221B]/65 transition duration-300 hover:-translate-y-1 hover:border-[#34D399]/25 hover:shadow-[0_15px_45px_rgba(0,0,0,0.2)]"
              >
                {/* COVER */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#101713]">
                  {project.coverImage ? (
                    <img
                      src={project.coverImage}
                      alt={`${project.title} cover`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#6EE7B7]">
                      <Code2 className="h-12 w-12" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#101713]/80 via-transparent to-[#101713]/10" />

                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    <span
                      className={`rounded-lg border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md ${statusStyle(project.status)}`}
                    >
                      {statusLabel(project.status)}
                    </span>

                    {project.isFeatured && (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-200 backdrop-blur-md">
                        <Star className="h-3 w-3 fill-current" />
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                    <div className="min-w-0">
                      {project.category && (
                        <p className="text-xs font-medium text-[#A7F3D0]">
                          {project.category}
                        </p>
                      )}
                      <h3 className="mt-1 line-clamp-1 text-lg font-semibold text-white">
                        {project.title}
                      </h3>
                    </div>

                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${project.title} live project`}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-black/30 text-white backdrop-blur-md transition hover:bg-[#34D399] hover:text-[#101713]"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-4 sm:p-5">
                  <p className="line-clamp-2 min-h-10 text-sm leading-5 text-[#A7B3AA]">
                    {project.shortDescription ||
                      project.description ||
                      "No project description added yet."}
                  </p>

                  {project.technologies.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.technologies.slice(0, 4).map((technology) => (
                        <span
                          key={technology}
                          className="rounded-md border border-white/[0.08] bg-[#101713]/70 px-2 py-1 text-[10px] text-[#A7B3AA]"
                        >
                          {technology}
                        </span>
                      ))}

                      {project.technologies.length > 4 && (
                        <span className="rounded-md border border-white/[0.08] bg-[#101713]/70 px-2 py-1 text-[10px] text-[#6EE7B7]">
                          +{project.technologies.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] pt-3 text-xs text-[#A7B3AA]">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(project.startDate) ?? "Date not set"}
                    </span>

                    <span>
                      {project.images.length}{" "}
                      {project.images.length === 1 ? "image" : "images"}
                    </span>
                  </div>

                  {/* ACTIONS */}
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => void toggleVisibility(project)}
                        aria-label={
                          project.isVisible
                            ? `Hide ${project.title}`
                            : `Show ${project.title}`
                        }
                        title={
                          project.isVisible
                            ? "Hide from public portfolio"
                            : "Show on public portfolio"
                        }
                        className="rounded-lg p-2 text-[#A7B3AA] transition hover:bg-white/[0.05] hover:text-[#6EE7B7]"
                      >
                        {project.isVisible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => void toggleFeatured(project)}
                        aria-label={
                          project.isFeatured
                            ? `Unfeature ${project.title}`
                            : `Feature ${project.title}`
                        }
                        title={
                          project.isFeatured
                            ? "Remove featured status"
                            : "Mark as featured"
                        }
                        className={`rounded-lg p-2 transition hover:bg-white/[0.05] ${
                          project.isFeatured
                            ? "text-amber-300"
                            : "text-[#A7B3AA] hover:text-amber-300"
                        }`}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            project.isFeatured ? "fill-current" : ""
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => startEdit(project)}
                        aria-label={`Edit ${project.title}`}
                        title="Edit project"
                        className="rounded-lg p-2 text-[#A7B3AA] transition hover:bg-white/[0.05] hover:text-[#6EE7B7]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => void deleteProject(project)}
                        disabled={deletingId === project.id}
                        aria-label={`Delete ${project.title}`}
                        title="Delete project"
                        className="rounded-lg p-2 text-[#A7B3AA] transition hover:bg-red-400/10 hover:text-red-300 disabled:opacity-50"
                      >
                        {deletingId === project.id ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={project.sortOrder <= 0}
                        onClick={() => void moveProject(project, -1)}
                        aria-label={`Move ${project.title} up`}
                        title="Move up"
                        className="rounded-md border border-white/10 p-2 text-[#A7B3AA] transition hover:border-[#34D399]/30 hover:text-[#6EE7B7] disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => void moveProject(project, 1)}
                        aria-label={`Move ${project.title} down`}
                        title="Move down"
                        className="rounded-md border border-white/10 p-2 text-[#A7B3AA] transition hover:border-[#34D399]/30 hover:text-[#6EE7B7]"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/[0.07] pt-3">
                    <span
                      className={`text-xs ${
                        project.isVisible
                          ? "text-[#6EE7B7]"
                          : "text-[#A7B3AA]"
                      }`}
                    >
                      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
                      {project.isVisible ? "Publicly visible" : "Hidden"}
                    </span>

                    {project.sourceCodeUrl && (
                      <a
                        href={project.sourceCodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-[#A7B3AA] transition hover:text-[#6EE7B7]"
                      >
                        <GitBranch className="h-5 w-5" />
                        Source code
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
