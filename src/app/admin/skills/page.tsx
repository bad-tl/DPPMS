
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
 import { ImageUpload } from "@/components/admin/image-upload";
import {
  AlertCircle,
  Code2,
  Database,
  Eye,
  EyeOff,
  GraduationCap,
  Layers3,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Wrench,
  X,
} from "lucide-react";

type SkillCategory =
  | "PROGRAMMING_LANGUAGES"
  | "FRAMEWORKS"
  | "DATABASES"
  | "TOOLS_AND_PLATFORMS"
  | "TECHNICAL"
  | "PROBLEM_SOLVING"
  | "SOFT_SKILLS"
  | "OTHER";

type Skill = {
  id: string;
  name: string;
  category: SkillCategory;
  description: string | null;
  proficiency: number;
  sortOrder: number;
  icon: string | null;
  iconPublicId: string | null;
  isVisible: boolean;
};

type SkillForm = {
  name: string;
  category: SkillCategory;
  description: string;
  proficiency: number;
  sortOrder: number;
  icon: string;
  iconPublicId: string;
  isVisible: boolean;
};

const categories: { value: SkillCategory; label: string }[] = [
  { value: "PROGRAMMING_LANGUAGES", label: "Programming Languages" },
  { value: "FRAMEWORKS", label: "Frameworks & Libraries" },
  { value: "DATABASES", label: "Databases" },
  { value: "TOOLS_AND_PLATFORMS", label: "Tools & Platforms" },
  { value: "TECHNICAL", label: "Technical Skills" },
  { value: "PROBLEM_SOLVING", label: "Problem Solving" },
  { value: "SOFT_SKILLS", label: "Soft Skills" },
  { value: "OTHER", label: "Other Skills" },
];

const initialForm: SkillForm = {
  name: "",
  category: "PROGRAMMING_LANGUAGES",
  description: "",
  proficiency: 70,
  sortOrder: 0,
  icon: "",
  iconPublicId: "",
  isVisible: true,
};

function proficiencyLabel(value: number) {
  if (value < 40) return "Beginner";
  if (value < 60) return "Developing";
  if (value < 75) return "Good";
  if (value < 90) return "Very Good";
  return "Excellent";
}

function categoryLabel(value: SkillCategory) {
  return categories.find((category) => category.value === value)?.label ?? value;
}

async function readResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    throw new Error(`The server returned an empty response (${response.status}).`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Unexpected server response (${response.status}).`);
  }
}

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [form, setForm] = useState<SkillForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadSkills = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/skills", { cache: "no-store" });
      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(result.error || "Unable to load skills.");
      }

      setSkills(result.skills ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load skills.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSkills();
  }, [loadSkills]);

  const visibleSkills = useMemo(() => {
    const query = search.trim().toLowerCase();

    return skills.filter((skill) => {
      const matchesCategory = filter === "ALL" || skill.category === filter;
      const matchesSearch =
        !query ||
        skill.name.toLowerCase().includes(query) ||
        (skill.description ?? "").toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [skills, search, filter]);

  const stats = useMemo(
    () => ({
      total: skills.length,
      visible: skills.filter((skill) => skill.isVisible).length,
      categories: new Set(skills.map((skill) => skill.category)).size,
      average: skills.length
        ? Math.round(
            skills.reduce((sum, skill) => sum + skill.proficiency, 0) /
              skills.length,
          )
        : 0,
    }),
    [skills],
  );

  function startCreate() {
    setEditingId(null);
    setForm({ ...initialForm, sortOrder: skills.length });
    setError("");
    setNotice("");
    setShowForm(true);
  }

  function startEdit(skill: Skill) {
    setEditingId(skill.id);
    setForm({
      name: skill.name,
      category: skill.category,
      description: skill.description ?? "",
      proficiency: skill.proficiency,
      sortOrder: skill.sortOrder,
      icon: skill.icon ?? "",
      iconPublicId: skill.iconPublicId ?? "",
      isVisible: skill.isVisible,
    });
    setError("");
    setNotice("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateForm<K extends keyof SkillForm>(key: K, value: SkillForm[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = {
        ...form,
        description: form.description.trim() || null,
        icon: form.icon.trim() || null,
        iconPublicId: form.iconPublicId.trim() || null,
      };

      const response = await fetch("/api/skills", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingId ? { ...payload, id: editingId } : payload,
        ),
      });

      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(result.error || "Unable to save skill.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(initialForm);
      setNotice(editingId ? "Skill updated successfully." : "Skill added successfully.");
      await loadSkills();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save skill.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteSkill(skill: Skill) {
    if (!window.confirm(`Delete "${skill.name}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(skill.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/skills", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: skill.id }),
      });

      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(result.error || "Unable to delete skill.");
      }

      setNotice(`${skill.name} was deleted.`);
      await loadSkills();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete skill.");
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleVisibility(skill: Skill) {
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/skills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: skill.id, isVisible: !skill.isVisible }),
      });

      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(result.error || "Unable to update visibility.");
      }

      setNotice(`${skill.name} is now ${skill.isVisible ? "hidden" : "visible"}.`);
      await loadSkills();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update visibility.");
    }
  }

  async function moveSkill(skill: Skill, direction: -1 | 1) {
    const sameCategory = skills
      .filter((item) => item.category === skill.category)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const index = sameCategory.findIndex((item) => item.id === skill.id);
    const other = sameCategory[index + direction];

    if (!other) return;

    setError("");
    setNotice("");

    try {
      const responses = await Promise.all([
        fetch("/api/skills", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: skill.id, sortOrder: other.sortOrder }),
        }),
        fetch("/api/skills", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: other.id, sortOrder: skill.sortOrder }),
        }),
      ]);

      const results = await Promise.all(responses.map(readResponse));
      const failedIndex = responses.findIndex((response) => !response.ok);

      if (failedIndex !== -1) {
        throw new Error(results[failedIndex].error || "Unable to reorder skills.");
      }

      await loadSkills();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reorder skills.");
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
              Skills <span className="text-[#6EE7B7]">&amp; expertise</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#A7B3AA] sm:text-base">
              Manage your technical capabilities, problem-solving strengths,
              and professional skills.
            </p>
          </div>

          <button
            type="button"
            onClick={startCreate}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#34D399] px-5 py-3 text-sm font-semibold text-[#101713] transition hover:bg-[#6EE7B7] focus:outline-none focus:ring-2 focus:ring-[#6EE7B7] focus:ring-offset-2 focus:ring-offset-[#101713]"
          >
            <Plus className="h-4 w-4" />
            Add skill
          </button>
        </header>

        {/* Feedback */}
        {error && (
          <div role="alert" className="flex gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.07] p-4 text-sm text-red-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div role="status" className="rounded-xl border border-[#34D399]/20 bg-[#34D399]/[0.06] p-4 text-sm text-[#6EE7B7]">
            {notice}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Total skills", value: stats.total, icon: Layers3 },
            { label: "Public skills", value: stats.visible, icon: Eye },
            { label: "Categories used", value: stats.categories, icon: GraduationCap },
            { label: "Average proficiency", value: `${stats.average}%`, icon: Sparkles },
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
                <p className="mt-1 text-xs text-[#A7B3AA] sm:text-sm">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Create/edit form */}
        {showForm && (
          <section className="overflow-hidden rounded-2xl border border-[#34D399]/20 bg-[#17221B]/80">
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] p-5 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#34D399]">
                  Skill details
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  {editingId ? "Edit skill" : "Add a new skill"}
                </h2>
                <p className="mt-1 text-sm text-[#A7B3AA]">
                  Enter accurate information about your capabilities.
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
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-medium">
                  Skill name <span className="text-[#34D399]">*</span>
                  <input
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={(event) => updateForm("name", event.target.value)}
                    placeholder="e.g. TypeScript"
                    className={inputClass}
                  />
                </label>

                <label className="block text-sm font-medium">
                  Category
                  <select
                    value={form.category}
                    onChange={(event) =>
                      updateForm("category", event.target.value as SkillCategory)
                    }
                    className={inputClass}
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block text-sm font-medium">
                Description <span className="font-normal text-[#718075]">(optional)</span>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={form.description}
                  onChange={(event) => updateForm("description", event.target.value)}
                  placeholder="Briefly describe how you use this skill."
                  className={`${inputClass} resize-y`}
                />
                <span className="mt-1 block text-right text-xs text-[#718075]">
                  {form.description.length}/1000
                </span>
              </label>

              {/* Proficiency slider */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#101713]/70 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <label htmlFor="proficiency" className="text-sm font-semibold">
                      Proficiency level
                    </label>
                    <p className="mt-1 text-xs leading-5 text-[#A7B3AA]">
                      Choose an honest estimate of your current ability.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-semibold tabular-nums text-[#6EE7B7]">
                      {form.proficiency}%
                    </span>
                    <p className="text-xs text-[#A7B3AA]">
                      {proficiencyLabel(form.proficiency)}
                    </p>
                  </div>
                </div>

                <input
                  id="proficiency"
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={form.proficiency}
                  onChange={(event) =>
                    updateForm("proficiency", Number(event.target.value))
                  }
                  className="mt-5 h-2 w-full cursor-pointer accent-[#34D399]"
                />

                <div className="mt-2 flex justify-between text-[10px] text-[#718075] sm:text-xs">
                  <span>Beginner</span>
                  <span>Developing</span>
                  <span>Good</span>
                  <span>Very good</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <ImageUpload
                  section="skills"
                  value={form.icon || null}
                  publicId={form.iconPublicId || null}
                  label="Skill Icon"
                  onChange={({ url, publicId }) => {
                    setForm((current) => ({
                      ...current,
                      icon: url ?? "",
                      iconPublicId: publicId ?? "",
                    }));
                  }}
                />
              </div>


              {form.icon && (
                <div className="flex items-center gap-3 rounded-xl border border-white/10 p-3">
                  <img
                    src={form.icon}
                    alt="Skill icon preview"
                    className="h-10 w-10 rounded-lg object-contain"
                  />
                  <span className="text-sm text-[#A7B3AA]">Icon preview</span>
                  <button
                    type="button"
                    onClick={() => {
                      updateForm("icon", "");
                      updateForm("iconPublicId", "");
                    }}
                    className="ml-auto text-xs text-red-300 hover:text-red-200"
                  >
                    Remove
                  </button>
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium">
                  Display order
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={form.sortOrder}
                    onChange={(event) =>
                      updateForm("sortOrder", Math.max(0, Number(event.target.value)))
                    }
                    className={inputClass}
                  />
                </label>

                <label className="flex cursor-pointer items-center gap-3 self-end rounded-xl border border-white/[0.08] bg-[#101713]/60 p-4">
                  <input
                    type="checkbox"
                    checked={form.isVisible}
                    onChange={(event) => updateForm("isVisible", event.target.checked)}
                    className="h-4 w-4 accent-[#34D399]"
                  />
                  <span>
                    <span className="block text-sm font-medium">Visible publicly</span>
                    <span className="mt-1 block text-xs text-[#A7B3AA]">
                      Allow visitors to see this skill.
                    </span>
                  </span>
                </label>
              </div>

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
                  {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  {saving ? "Saving..." : editingId ? "Save changes" : "Create skill"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Search and category filters */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718075]" />
              <input
                aria-label="Search skills"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search your skills..."
                className="w-full rounded-xl border border-white/10 bg-[#17221B]/70 py-3 pl-10 pr-4 text-sm outline-none placeholder:text-[#718075] focus:border-[#34D399]/50"
              />
            </div>
            <select
              aria-label="Filter skills by category"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-xl border border-white/10 bg-[#17221B] px-4 py-3 text-sm outline-none focus:border-[#34D399]/50 sm:max-w-xs"
            >
              <option value="ALL">All categories</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Your skills</h2>
            <span className="text-xs text-[#A7B3AA]">
              {visibleSkills.length} {visibleSkills.length === 1 ? "result" : "results"}
            </span>
          </div>
        </section>

        {/* Skills list */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/[0.08] bg-[#17221B]/50 py-16 text-sm text-[#A7B3AA]">
            <LoaderCircle className="h-5 w-5 animate-spin text-[#34D399]" />
            Loading skills...
          </div>
        ) : visibleSkills.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-[#17221B]/30 px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#34D399]/20 bg-[#34D399]/[0.06] text-[#6EE7B7]">
              <Code2 className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">
              {skills.length ? "No matching skills" : "Start building your skills profile"}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#A7B3AA]">
              {skills.length
                ? "Try another search term or category."
                : "Add your programming languages, frameworks, technical strengths, and professional skills."}
            </p>
            {skills.length === 0 && (
              <button
                type="button"
                onClick={startCreate}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#34D399] px-4 py-3 text-sm font-semibold text-[#101713] hover:bg-[#6EE7B7]"
              >
                <Plus className="h-4 w-4" />
                Add your first skill
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {visibleSkills.map((skill) => (
              <article
                key={skill.id}
                className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#17221B]/65 p-4 transition hover:border-[#34D399]/25 sm:p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#34D399]/15 bg-[#101713]">
                    {skill.icon ? (
                      <img
                        src={skill.icon}
                        alt=""
                        className="h-full w-full object-contain p-1.5"
                      />
                    ) : skill.category === "DATABASES" ? (
                      <Database className="h-5 w-5 text-[#6EE7B7]" />
                    ) : skill.category === "TOOLS_AND_PLATFORMS" ? (
                      <Wrench className="h-5 w-5 text-[#6EE7B7]" />
                    ) : skill.category === "SOFT_SKILLS" ? (
                      <Sparkles className="h-5 w-5 text-[#6EE7B7]" />
                    ) : (
                      <Code2 className="h-5 w-5 text-[#6EE7B7]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="break-words font-semibold">{skill.name}</h3>
                    <p className="mt-1 break-words text-xs leading-5 text-[#A7B3AA]">
                      {categoryLabel(skill.category)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => void toggleVisibility(skill)}
                      aria-label={skill.isVisible ? `Hide ${skill.name}` : `Show ${skill.name}`}
                      title={skill.isVisible ? "Hide from public portfolio" : "Show on public portfolio"}
                      className="rounded-lg p-2 text-[#A7B3AA] transition hover:bg-white/[0.05] hover:text-[#6EE7B7]"
                    >
                      {skill.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(skill)}
                      aria-label={`Edit ${skill.name}`}
                      className="rounded-lg p-2 text-[#A7B3AA] transition hover:bg-white/[0.05] hover:text-[#6EE7B7]"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteSkill(skill)}
                      disabled={deletingId === skill.id}
                      aria-label={`Delete ${skill.name}`}
                      className="rounded-lg p-2 text-[#A7B3AA] transition hover:bg-red-400/10 hover:text-red-300 disabled:opacity-50"
                    >
                      {deletingId === skill.id ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {skill.description && (
                  <p className="mt-4 break-words text-sm leading-6 text-[#A7B3AA]">
                    {skill.description}
                  </p>
                )}

                <div className="mt-5">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-[#A7B3AA]">Proficiency</span>
                    <span className="text-xs font-medium text-[#6EE7B7]">
                      {proficiencyLabel(skill.proficiency)} · {skill.proficiency}%
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`${skill.name} proficiency`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={skill.proficiency}
                    className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]"
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#34D399] to-[#6EE7B7] transition-[width] duration-500"
                      style={{ width: `${skill.proficiency}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-3">
                  <span className={`text-xs ${skill.isVisible ? "text-[#6EE7B7]" : "text-[#A7B3AA]"}`}>
                    <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
                    {skill.isVisible ? "Publicly visible" : "Hidden from public"}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={skill.sortOrder <= 0}
                      onClick={() => void moveSkill(skill, -1)}
                      className="rounded-md border border-white/10 px-2.5 py-1.5 text-xs text-[#A7B3AA] hover:border-[#34D399]/30 hover:text-[#6EE7B7] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      Move up
                    </button>
                    <button
                      type="button"
                      onClick={() => void moveSkill(skill, 1)}
                      className="rounded-md border border-white/10 px-2.5 py-1.5 text-xs text-[#A7B3AA] hover:border-[#34D399]/30 hover:text-[#6EE7B7]"
                    >
                      Move down
                    </button>
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
