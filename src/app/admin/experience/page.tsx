
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ImageUpload } from "@/components/admin/image-upload";
import {
  AlertCircle,
  BriefcaseBusiness,
  CalendarDays,
  Eye,
  EyeOff,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "INTERNSHIP"
  | "CONTRACT"
  | "FREELANCE"
  | "SELF_EMPLOYED"
  | "VOLUNTEER"
  | "OTHER";

type Highlight = {
  id?: string;
  content: string;
  sortOrder: number;
};

type Experience = {
  id: string;
  company: string;
  position: string;
  employmentType: EmploymentType;
  location: string | null;
  description: string | null;
  startDate: string;
  endDate: string | null;
  isCurrentlyWorking: boolean;
  companyLogo: string | null;
  companyLogoPublicId: string | null;
  isVisible: boolean;
  sortOrder: number;
  highlights: Highlight[];
};

type ExperienceForm = {
  company: string;
  position: string;
  employmentType: EmploymentType;
  location: string;
  description: string;
  startDate: string;
  endDate: string;
  isCurrentlyWorking: boolean;
  companyLogo: string;
  companyLogoPublicId: string;
  isVisible: boolean;
  sortOrder: number;
  highlights: Highlight[];
};

const employmentTypes: { value: EmploymentType; label: string }[] = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "CONTRACT", label: "Contract" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "SELF_EMPLOYED", label: "Self-employed" },
  { value: "VOLUNTEER", label: "Volunteer" },
  { value: "OTHER", label: "Other" },
];

const initialForm: ExperienceForm = {
  company: "",
  position: "",
  employmentType: "FULL_TIME",
  location: "",
  description: "",
  startDate: "",
  endDate: "",
  isCurrentlyWorking: false,
  companyLogo: "",
  companyLogoPublicId: "",
  isVisible: true,
  sortOrder: 0,
  highlights: [],
};

function employmentLabel(value: EmploymentType) {
  return (
    employmentTypes.find((type) => type.value === value)?.label ?? value
  );
}

function dateInputValue(value: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function formatDate(value: string | null) {
  if (!value) return "Present";

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

async function readResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    throw new Error(`Empty server response (${response.status}).`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Unexpected server response (${response.status}).`);
  }
}

export default function AdminExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [form, setForm] = useState<ExperienceForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadExperiences = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/experience", {
        cache: "no-store",
      });

      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(result.error || "Unable to load experiences.");
      }

      setExperiences(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load experiences."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadExperiences();
  }, [loadExperiences]);

  const filteredExperiences = useMemo(() => {
    const query = search.trim().toLowerCase();

    return experiences.filter((experience) => {
      const matchesFilter =
        filter === "ALL" || experience.employmentType === filter;

      const matchesSearch =
        !query ||
        experience.company.toLowerCase().includes(query) ||
        experience.position.toLowerCase().includes(query) ||
        (experience.location ?? "").toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [experiences, search, filter]);

  const stats = useMemo(
    () => ({
      total: experiences.length,
      visible: experiences.filter((item) => item.isVisible).length,
      current: experiences.filter((item) => item.isCurrentlyWorking).length,
      highlights: experiences.reduce(
        (total, item) => total + item.highlights.length,
        0
      ),
    }),
    [experiences]
  );

  function updateForm<K extends keyof ExperienceForm>(
    key: K,
    value: ExperienceForm[K]
  ) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function startCreate() {
    setEditingId(null);
    setForm({
      ...initialForm,
      sortOrder: experiences.length,
      highlights: [],
    });
    setError("");
    setNotice("");
    setShowForm(true);
  }

  function startEdit(experience: Experience) {
    setEditingId(experience.id);

    setForm({
      company: experience.company,
      position: experience.position,
      employmentType: experience.employmentType,
      location: experience.location ?? "",
      description: experience.description ?? "",
      startDate: dateInputValue(experience.startDate),
      endDate: dateInputValue(experience.endDate),
      isCurrentlyWorking: experience.isCurrentlyWorking,
      companyLogo: experience.companyLogo ?? "",
      companyLogoPublicId: experience.companyLogoPublicId ?? "",
      isVisible: experience.isVisible,
      sortOrder: experience.sortOrder,
      highlights: experience.highlights.map((item, index) => ({
        content: item.content,
        sortOrder: item.sortOrder ?? index,
      })),
    });

    setError("");
    setNotice("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addHighlight() {
    setForm((previous) => ({
      ...previous,
      highlights: [
        ...previous.highlights,
        {
          content: "",
          sortOrder: previous.highlights.length,
        },
      ],
    }));
  }

  function updateHighlight(index: number, content: string) {
    setForm((previous) => ({
      ...previous,
      highlights: previous.highlights.map((item, i) =>
        i === index ? { ...item, content } : item
      ),
    }));
  }

  function removeHighlight(index: number) {
    setForm((previous) => ({
      ...previous,
      highlights: previous.highlights
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, sortOrder: i })),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      if (!form.startDate) {
        throw new Error("Please select a start date.");
      }

      if (!form.isCurrentlyWorking && !form.endDate) {
        throw new Error("Please select an end date or mark this as current employment.");
      }

      if (
        form.endDate &&
        new Date(form.endDate) < new Date(form.startDate)
      ) {
        throw new Error("End date cannot be earlier than start date.");
      }

      const payload = {
        ...form,
        location: form.location.trim() || null,
        description: form.description.trim() || null,
        companyLogo: form.companyLogo.trim() || null,
        companyLogoPublicId: form.companyLogoPublicId.trim() || null,
        startDate: new Date(form.startDate).toISOString(),
        endDate: form.isCurrentlyWorking
          ? null
          : new Date(form.endDate).toISOString(),
        highlights: form.highlights
          .map((item, index) => ({
            content: item.content.trim(),
            sortOrder: index,
          }))
          .filter((item) => item.content.length > 0),
      };

      const response = await fetch("/api/experience", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingId ? { ...payload, id: editingId } : payload
        ),
      });

      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(result.error || "Unable to save experience.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(initialForm);

      setNotice(
        editingId
          ? "Experience updated successfully."
          : "Experience added successfully."
      );

      await loadExperiences();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save experience."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteExperience(experience: Experience) {
    if (
      !window.confirm(
        `Delete your experience at "${experience.company}"? This cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(experience.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/experience?id=${encodeURIComponent(experience.id)}`,
        { method: "DELETE" }
      );

      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(result.error || "Unable to delete experience.");
      }

      setNotice(`${experience.company} experience was deleted.`);
      await loadExperiences();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete experience."
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleVisibility(experience: Experience) {
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/experience", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: experience.id,
          isVisible: !experience.isVisible,
        }),
      });

      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(result.error || "Unable to update visibility.");
      }

      setNotice(
        `${experience.company} is now ${
          experience.isVisible ? "hidden" : "visible"
        }.`
      );

      await loadExperiences();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update visibility."
      );
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-[#101713] px-4 py-3 text-sm text-[#F5F5F0] outline-none transition placeholder:text-[#718075] focus:border-[#34D399]/60 focus:ring-2 focus:ring-[#34D399]/10";

  return (
    <div className="min-h-screen bg-[#101713] px-4 py-7 text-[#F5F5F0] sm:px-6 sm:py-9 lg:px-9">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Page heading */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#34D399]">
              <Sparkles className="h-4 w-4" />
              Portfolio management
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Experience{" "}
              <span className="text-[#6EE7B7]">&amp; career</span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#A7B3AA] sm:text-base">
              Manage your professional journey, employment history, and
              achievements.
            </p>
          </div>

          <button
            type="button"
            onClick={startCreate}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#34D399] px-5 py-3 text-sm font-semibold text-[#101713] transition hover:bg-[#6EE7B7] focus:outline-none focus:ring-2 focus:ring-[#6EE7B7]"
          >
            <Plus className="h-4 w-4" />
            Add experience
          </button>
        </header>

        {/* Feedback */}
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

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Total experiences", value: stats.total, icon: BriefcaseBusiness },
            { label: "Public experiences", value: stats.visible, icon: Eye },
            { label: "Current positions", value: stats.current, icon: CalendarDays },
            { label: "Career highlights", value: stats.highlights, icon: Sparkles },
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

        {/* Create / Edit form */}
        {showForm && (
          <section className="overflow-hidden rounded-2xl border border-[#34D399]/20 bg-[#17221B]/80">
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] p-5 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#34D399]">
                  Professional details
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  {editingId ? "Edit experience" : "Add a new experience"}
                </h2>

                <p className="mt-1 text-sm text-[#A7B3AA]">
                  Provide details about your position and responsibilities.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close form"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-[#A7B3AA] transition hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
              {/* Position details */}
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-medium">
                  Job position <span className="text-[#34D399]">*</span>
                  <input
                    required
                    maxLength={150}
                    value={form.position}
                    onChange={(e) => updateForm("position", e.target.value)}
                    placeholder="e.g. Full-Stack Developer"
                    className={inputClass}
                  />
                </label>

                <label className="block text-sm font-medium">
                  Company / Organization{" "}
                  <span className="text-[#34D399]">*</span>
                  <input
                    required
                    maxLength={150}
                    value={form.company}
                    onChange={(e) => updateForm("company", e.target.value)}
                    placeholder="e.g. Ethio Telecom"
                    className={inputClass}
                  />
                </label>

                <label className="block text-sm font-medium">
                  Employment type
                  <select
                    value={form.employmentType}
                    onChange={(e) =>
                      updateForm(
                        "employmentType",
                        e.target.value as EmploymentType
                      )
                    }
                    className={inputClass}
                  >
                    {employmentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium">
                  Location
                  <span className="font-normal text-[#718075]"> (optional)</span>
                  <input
                    maxLength={150}
                    value={form.location}
                    onChange={(e) => updateForm("location", e.target.value)}
                    placeholder="e.g. Addis Ababa, Ethiopia"
                    className={inputClass}
                  />
                </label>
              </div>

              {/* Employment dates */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#101713]/70 p-4 sm:p-5">
                <div className="mb-5">
                  <h3 className="text-sm font-semibold">Employment duration</h3>
                  <p className="mt-1 text-xs text-[#A7B3AA]">
                    Specify when you started and finished this position.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-medium">
                    Start date <span className="text-[#34D399]">*</span>
                    <input
                      required
                      type="date"
                      value={form.startDate}
                      onChange={(e) => updateForm("startDate", e.target.value)}
                      className={inputClass}
                    />
                  </label>

                  <label className="block text-sm font-medium">
                    End date
                    <input
                      type="date"
                      disabled={form.isCurrentlyWorking}
                      value={form.endDate}
                      onChange={(e) => updateForm("endDate", e.target.value)}
                      className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-40`}
                    />
                  </label>
                </div>

                <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.08] bg-[#17221B]/70 p-4">
                  <input
                    type="checkbox"
                    checked={form.isCurrentlyWorking}
                    onChange={(e) => {
                      updateForm("isCurrentlyWorking", e.target.checked);
                      if (e.target.checked) updateForm("endDate", "");
                    }}
                    className="h-4 w-4 accent-[#34D399]"
                  />

                  <span>
                    <span className="block text-sm font-medium">
                      I currently work here
                    </span>
                    <span className="mt-1 block text-xs text-[#A7B3AA]">
                      This position will display as Present.
                    </span>
                  </span>
                </label>
              </div>

              {/* Description */}
              <label className="block text-sm font-medium">
                Position description
                <span className="font-normal text-[#718075]"> (optional)</span>
                <textarea
                  rows={4}
                  maxLength={5000}
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  placeholder="Describe your role, the organization, or the work you performed."
                  className={`${inputClass} resize-y`}
                />
                <span className="mt-1 block text-right text-xs text-[#718075]">
                  {form.description.length}/5000
                </span>
              </label>

              {/* Highlights */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#101713]/70 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold">
                      Responsibilities &amp; achievements
                    </h3>
                    <p className="mt-1 text-xs text-[#A7B3AA]">
                      Add the important things you did in this position.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addHighlight}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#34D399]/20 px-3 py-2 text-xs font-semibold text-[#6EE7B7] transition hover:bg-[#34D399]/10"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add highlight
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  {form.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="mt-3 text-sm text-[#34D399]">
                        {index + 1}.
                      </span>

                      <textarea
                        rows={2}
                        maxLength={1000}
                        value={highlight.content}
                        onChange={(e) =>
                          updateHighlight(index, e.target.value)
                        }
                        placeholder="Describe a responsibility or achievement..."
                        className={`${inputClass} mt-0 resize-y`}
                      />

                      <button
                        type="button"
                        onClick={() => removeHighlight(index)}
                        aria-label={`Remove highlight ${index + 1}`}
                        className="mt-1 rounded-lg p-2 text-[#A7B3AA] hover:bg-red-400/10 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {form.highlights.length === 0 && (
                    <p className="rounded-xl border border-dashed border-white/10 px-4 py-7 text-center text-sm text-[#718075]">
                      No highlights added yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Company logo */}
              <div>
                <ImageUpload
                  section="experience"
                  value={form.companyLogo || null}
                  publicId={form.companyLogoPublicId || null}
                  label="Company logo"
                  onChange={({ url, publicId }) => {
                    setForm((current) => ({
                      ...current,
                      companyLogo: url ?? "",
                      companyLogoPublicId: publicId ?? "",
                    }));
                  }}
                />
              </div>

              {form.companyLogo && (
                <div className="flex items-center gap-3 rounded-xl border border-white/10 p-3">
                  <img
                    src={form.companyLogo}
                    alt="Company logo preview"
                    className="h-12 w-12 rounded-lg bg-white/5 object-contain p-1"
                  />

                  <span className="text-sm text-[#A7B3AA]">
                    Company logo preview
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      updateForm("companyLogo", "");
                      updateForm("companyLogoPublicId", "");
                    }}
                    className="ml-auto text-xs text-red-300 hover:text-red-200"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Display settings */}
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium">
                  Display order
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={form.sortOrder}
                    onChange={(e) =>
                      updateForm(
                        "sortOrder",
                        Math.max(0, Number(e.target.value))
                      )
                    }
                    className={inputClass}
                  />
                </label>

                <label className="flex cursor-pointer items-center gap-3 self-end rounded-xl border border-white/[0.08] bg-[#101713]/60 p-4">
                  <input
                    type="checkbox"
                    checked={form.isVisible}
                    onChange={(e) => updateForm("isVisible", e.target.checked)}
                    className="h-4 w-4 accent-[#34D399]"
                  />

                  <span>
                    <span className="block text-sm font-medium">
                      Visible publicly
                    </span>
                    <span className="mt-1 block text-xs text-[#A7B3AA]">
                      Allow visitors to see this experience.
                    </span>
                  </span>
                </label>
              </div>

              {/* Form actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-white/[0.08] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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
                      : "Create experience"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Search and filters */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718075]" />
              <input
                aria-label="Search experiences"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search companies or positions..."
                className="w-full rounded-xl border border-white/10 bg-[#17221B]/70 py-3 pl-10 pr-4 text-sm outline-none placeholder:text-[#718075] focus:border-[#34D399]/50"
              />
            </div>

            <select
              aria-label="Filter experiences by employment type"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#17221B] px-4 py-3 text-sm outline-none focus:border-[#34D399]/50 sm:max-w-xs"
            >
              <option value="ALL">All employment types</option>
              {employmentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Your experience</h2>
            <span className="text-xs text-[#A7B3AA]">
              {filteredExperiences.length}{" "}
              {filteredExperiences.length === 1 ? "result" : "results"}
            </span>
          </div>
        </section>

        {/* Experience list */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/[0.08] bg-[#17221B]/50 py-16 text-sm text-[#A7B3AA]">
            <LoaderCircle className="h-5 w-5 animate-spin text-[#34D399]" />
            Loading experiences...
          </div>
        ) : filteredExperiences.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-[#17221B]/30 px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#34D399]/20 bg-[#34D399]/[0.06] text-[#6EE7B7]">
              <BriefcaseBusiness className="h-7 w-7" />
            </div>

            <h3 className="mt-5 text-lg font-semibold">
              {experiences.length
                ? "No matching experiences"
                : "Start building your career profile"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#A7B3AA]">
              {experiences.length
                ? "Try another search term or employment type."
                : "Add your internships, jobs, freelance work, and other professional experiences."}
            </p>

            {experiences.length === 0 && (
              <button
                type="button"
                onClick={startCreate}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#34D399] px-4 py-3 text-sm font-semibold text-[#101713] hover:bg-[#6EE7B7]"
              >
                <Plus className="h-4 w-4" />
                Add your first experience
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {filteredExperiences.map((experience) => (
              <article
                key={experience.id}
                className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#17221B]/65 p-4 transition hover:border-[#34D399]/25 sm:p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#34D399]/15 bg-[#101713]">
                    {experience.companyLogo ? (
                      <img
                        src={experience.companyLogo}
                        alt=""
                        className="h-full w-full object-contain p-1.5"
                      />
                    ) : (
                      <BriefcaseBusiness className="h-5 w-5 text-[#6EE7B7]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="break-words font-semibold">
                      {experience.position}
                    </h3>

                    <p className="mt-1 break-words text-sm text-[#6EE7B7]">
                      {experience.company}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => void toggleVisibility(experience)}
                      aria-label={
                        experience.isVisible
                          ? "Hide experience"
                          : "Show experience"
                      }
                      title={
                        experience.isVisible
                          ? "Hide from public portfolio"
                          : "Show on public portfolio"
                      }
                      className="rounded-lg p-2 text-[#A7B3AA] transition hover:bg-white/[0.05] hover:text-[#6EE7B7]"
                    >
                      {experience.isVisible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => startEdit(experience)}
                      aria-label="Edit experience"
                      className="rounded-lg p-2 text-[#A7B3AA] transition hover:bg-white/[0.05] hover:text-[#6EE7B7]"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => void deleteExperience(experience)}
                      disabled={deletingId === experience.id}
                      aria-label="Delete experience"
                      className="rounded-lg p-2 text-[#A7B3AA] transition hover:bg-red-400/10 hover:text-red-300 disabled:opacity-50"
                    >
                      {deletingId === experience.id ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#A7B3AA]">
                  <span className="rounded-lg border border-[#34D399]/15 bg-[#34D399]/[0.06] px-2.5 py-1 text-[#6EE7B7]">
                    {employmentLabel(experience.employmentType)}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(experience.startDate)} –{" "}
                    {experience.isCurrentlyWorking
                      ? "Present"
                      : formatDate(experience.endDate)}
                  </span>

                  {experience.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {experience.location}
                    </span>
                  )}
                </div>

                {experience.description && (
                  <p className="mt-4 break-words text-sm leading-6 text-[#A7B3AA]">
                    {experience.description}
                  </p>
                )}

                {experience.highlights.length > 0 && (
                  <div className="mt-4 border-t border-white/[0.07] pt-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#A7B3AA]">
                      Key responsibilities &amp; achievements
                    </p>

                    <ul className="space-y-2">
                      {experience.highlights.map((highlight, index) => (
                        <li
                          key={highlight.id ?? index}
                          className="flex items-start gap-2 text-sm leading-5 text-[#A7B3AA]"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#34D399]" />
                          <span className="break-words">
                            {highlight.content}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-3">
                  <span
                    className={`text-xs ${
                      experience.isVisible
                        ? "text-[#6EE7B7]"
                        : "text-[#A7B3AA]"
                    }`}
                  >
                    <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
                    {experience.isVisible
                      ? "Publicly visible"
                      : "Hidden from public"}
                  </span>

                  <span className="text-xs text-[#718075]">
                    Order: {experience.sortOrder}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
