
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
  UserRound,
} from "lucide-react";
import { ImageUpload } from "@/components/admin/image-upload";

type Category = "STRENGTH" | "VALUE" | "INTEREST";

type Highlight = {
  label: string;
  value: string;
  sortOrder: number;
};

type Strength = {
  title: string;
  description: string;
  category: Category;
  sortOrder: number;
};

type AboutData = {
  sectionTitle: string;
  subtitle: string;
  biography: string;
  imageUrl: string | null;
  imagePublicId: string | null;
  professionalRole: string;
  professionalStatus: string;
  yearsOfExperience: number;
  projectsCompleted: number;
  happyClients: number;
  isVisible: boolean;
  highlights: Highlight[];
  strengths: Strength[];
};

const emptyAbout: AboutData = {
  sectionTitle: "About Me",
  subtitle: "A little about who I am",
  biography: "",
  imageUrl: null,
  imagePublicId: null,
  professionalRole: "",
  professionalStatus: "",
  yearsOfExperience: 0,
  projectsCompleted: 0,
  happyClients: 0,
  isVisible: true,
  highlights: [],
  strengths: [],
};

const categories: { value: Category; label: string }[] = [
  { value: "STRENGTH", label: "Strength" },
  { value: "VALUE", label: "Value" },
  { value: "INTEREST", label: "Interest" },
];

const inputClass =
  "w-full rounded-xl border border-[#29382F] bg-[#101713] px-4 py-3 text-sm text-[#F5F7F5] outline-none transition placeholder:text-[#718077] focus:border-[#34D399] focus:ring-2 focus:ring-[#34D399]/10";

const labelClass = "mb-2 block text-sm font-medium text-[#D5DED7]";

const panelClass =
  "rounded-2xl border border-[#29382F] bg-[#17221B] p-5 sm:p-6";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {hint && (
        <p className="mt-2 text-xs leading-5 text-[#A7B3AA]">{hint}</p>
      )}
    </div>
  );
}

export default function AdminAboutPage() {
  const [about, setAbout] = useState<AboutData>(emptyAbout);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const update = useCallback(
    <K extends keyof AboutData>(key: K, value: AboutData[K]) => {
      setAbout((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadAbout() {
      try {
        const response = await fetch("/api/about", {
          credentials: "same-origin",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Unable to load About content.",
          );
        }

        if (!cancelled && result.about) {
          setAbout({
            ...emptyAbout,
            ...result.about,
            highlights: (result.about.highlights ?? []).map(
              (item: Highlight) => ({
                label: item.label,
                value: item.value,
                sortOrder: item.sortOrder,
              }),
            ),
            strengths: (result.about.strengths ?? []).map(
              (item: Strength) => ({
                title: item.title,
                description: item.description ?? "",
                category: item.category,
                sortOrder: item.sortOrder,
              }),
            ),
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load About content.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadAbout();

    return () => {
      cancelled = true;
    };
  }, []);

  async function saveAbout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const payload: AboutData = {
      ...about,
      yearsOfExperience: Number(about.yearsOfExperience),
      projectsCompleted: Number(about.projectsCompleted),
      happyClients: Number(about.happyClients),
      highlights: about.highlights.map((item, index) => ({
        ...item,
        sortOrder: index,
      })),
      strengths: about.strengths.map((item, index) => ({
        ...item,
        sortOrder: index,
      })),
    };

    try {
      const response = await fetch("/api/about", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to save About content.",
        );
      }

      if (result.about) {
        setAbout((current) => ({
          ...current,
          ...result.about,
          highlights: (result.about.highlights ?? []).map(
            (item: Highlight) => ({
              label: item.label,
              value: item.value,
              sortOrder: item.sortOrder,
            }),
          ),
          strengths: (result.about.strengths ?? []).map(
            (item: Strength) => ({
              title: item.title,
              description: item.description ?? "",
              category: item.category,
              sortOrder: item.sortOrder,
            }),
          ),
        }));
      }

      setSuccess(result.message || "About content saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save About content.",
      );
    } finally {
      setSaving(false);
    }
  }

  function addHighlight() {
    setAbout((current) => ({
      ...current,
      highlights: [
        ...current.highlights,
        { label: "", value: "", sortOrder: current.highlights.length },
      ],
    }));
  }

  function updateHighlight(
    index: number,
    key: "label" | "value",
    value: string,
  ) {
    setAbout((current) => ({
      ...current,
      highlights: current.highlights.map((item, i) =>
        i === index ? { ...item, [key]: value } : item,
      ),
    }));
  }

  function addStrength(category: Category = "STRENGTH") {
    setAbout((current) => ({
      ...current,
      strengths: [
        ...current.strengths,
        {
          title: "",
          description: "",
          category,
          sortOrder: current.strengths.length,
        },
      ],
    }));
  }

  function updateStrength(
    index: number,
    key: "title" | "description" | "category",
    value: string,
  ) {
    setAbout((current) => ({
      ...current,
      strengths: current.strengths.map((item, i) =>
        i === index
          ? { ...item, [key]: value }
          : item,
      ),
    }));
  }

  function moveHighlight(index: number, direction: -1 | 1) {
    setAbout((current) => {
      const items = [...current.highlights];
      const target = index + direction;

      if (target < 0 || target >= items.length) return current;

      [items[index], items[target]] = [items[target], items[index]];

      return {
        ...current,
        highlights: items.map((item, i) => ({ ...item, sortOrder: i })),
      };
    });
  }

  function moveStrength(index: number, direction: -1 | 1) {
    setAbout((current) => {
      const items = [...current.strengths];
      const target = index + direction;

      if (target < 0 || target >= items.length) return current;

      [items[index], items[target]] = [items[target], items[index]];

      return {
        ...current,
        strengths: items.map((item, i) => ({ ...item, sortOrder: i })),
      };
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#101713] text-[#A7B3AA]">
        <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-[#34D399]" />
        Loading About section...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101713] px-4 py-6 text-[#F5F7F5] sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#34D399]">
              <span className="h-2 w-2 rounded-full bg-[#34D399]" />
              Portfolio content
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              About section
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#A7B3AA]">
              Tell your story, highlight your experience, and show visitors
              what makes you different.
            </p>
          </div>

          <button
            type="submit"
            form="about-form"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#34D399] px-5 py-3 text-sm font-semibold text-[#062C20] transition hover:bg-[#6EE7B7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save changes"}
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 rounded-xl border border-[#34D399]/30 bg-[#34D399]/10 p-4 text-sm text-[#A7F3D0]"
          >
            <Check className="h-5 w-5 shrink-0" />
            {success}
          </div>
        )}

        <form id="about-form" onSubmit={saveAbout} className="space-y-6">
          <section className={panelClass}>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Section details</h2>
                <p className="mt-1 text-sm text-[#A7B3AA]">
                  Set the heading and control public visibility.
                </p>
              </div>

              <button
                type="button"
                onClick={() => update("isVisible", !about.isVisible)}
                aria-pressed={about.isVisible}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                  about.isVisible
                    ? "border-[#34D399]/30 bg-[#34D399]/10 text-[#6EE7B7]"
                    : "border-[#47554B] bg-[#101713] text-[#A7B3AA]"
                }`}
              >
                {about.isVisible ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
                {about.isVisible ? "Visible" : "Hidden"}
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Section title">
                <input
                  className={inputClass}
                  value={about.sectionTitle}
                  onChange={(e) => update("sectionTitle", e.target.value)}
                  maxLength={100}
                  required
                />
              </Field>
              <Field label="Subtitle">
                <input
                  className={inputClass}
                  value={about.subtitle}
                  onChange={(e) => update("subtitle", e.target.value)}
                  maxLength={200}
                />
              </Field>
            </div>
          </section>

          <section className={panelClass}>
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Your story</h2>
              <p className="mt-1 text-sm text-[#A7B3AA]">
                Add a profile photo and a clear, personal biography.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-[#D5DED7]">
                  <UserRound className="h-4 w-4 text-[#34D399]" />
                  Profile image
                </div>
                <ImageUpload
                  section="about"
                  label="Upload About image"
                  value={about.imageUrl ?? ""}
                  publicId={about.imagePublicId ?? ""}
                  onChange={({ url, publicId }) => {
                    update("imageUrl", url || null);
                    update("imagePublicId", publicId || null);
                  }}
                />
                <p className="text-xs leading-5 text-[#A7B3AA]">
                  Choose a clear, professional image. Images must meet your
                  existing uploader&apos;s file-size limit.
                </p>
              </div>

              <div>
                <Field
                  label="Biography"
                  hint="Use paragraphs to describe your background, skills, interests, and professional journey."
                >
                  <textarea
                    className={`${inputClass} min-h-64 resize-y leading-7`}
                    value={about.biography}
                    onChange={(e) => update("biography", e.target.value)}
                    maxLength={5000}
                    placeholder="Write your story here..."
                    required
                  />
                  <p className="mt-2 text-right text-xs text-[#A7B3AA]">
                    {about.biography.length}/5000
                  </p>
                </Field>
              </div>
            </div>
          </section>

          <section className={panelClass}>
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Professional profile</h2>
              <p className="mt-1 text-sm text-[#A7B3AA]">
                Tell visitors what you do and where you are professionally.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Professional role">
                <input
                  className={inputClass}
                  value={about.professionalRole ?? ""}
                  onChange={(e) =>
                  update("professionalRole", e.target.value)
                  }
                  maxLength={150}
                  placeholder="e.g. Full-Stack Developer"
                />
              </Field>
              <Field label="Professional status">
                <input
                  className={inputClass}
                  value={about.professionalStatus ?? ""}
                  onChange={(e) =>
                   update("professionalStatus", e.target.value)
                  }
                  maxLength={100}
                  placeholder="e.g. Computer Science Student"
                />
              </Field>
            </div>
          </section>

          <section className={panelClass}>
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Key statistics</h2>
              <p className="mt-1 text-sm text-[#A7B3AA]">
                Enter accurate figures for your public portfolio.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {(
                [
                  ["yearsOfExperience", "Years of experience", 100],
                  ["projectsCompleted", "Projects completed", 1000000],
                  ["happyClients", "Happy clients", 1000000],
                ] as const
              ).map(([key, label, max]) => (
                <Field key={key} label={label}>
                  <input
                    type="number"
                    min={0}
                    max={max}
                    step={1}
                    className={inputClass}
                    value={about[key]}
                    onChange={(e) =>
                      update(key, Math.max(0, Number(e.target.value)) as never)
                    }
                    required
                  />
                </Field>
              ))}
            </div>
          </section>

          <section className={panelClass}>
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-semibold">Achievement highlights</h2>
                <p className="mt-1 text-sm text-[#A7B3AA]">
                  Add awards, qualifications, milestones, or accomplishments.
                </p>
              </div>
              <button
                type="button"
                onClick={addHighlight}
                disabled={about.highlights.length >= 50}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#34D399]/30 px-4 py-2.5 text-sm font-medium text-[#6EE7B7] hover:bg-[#34D399]/10 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add highlight
              </button>
            </div>

            {about.highlights.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#47554B] px-4 py-8 text-center text-sm text-[#A7B3AA]">
                No highlights yet. Add your first achievement.
              </div>
            ) : (
              <div className="space-y-4">
                {about.highlights.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-[#29382F] bg-[#101713]/70 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#6EE7B7]">
                        Highlight {index + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="Move up"
                          disabled={index === 0}
                          onClick={() => moveHighlight(index, -1)}
                          className="rounded-lg p-2 text-[#A7B3AA] hover:bg-[#29382F] disabled:opacity-30"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Move down"
                          disabled={index === about.highlights.length - 1}
                          onClick={() => moveHighlight(index, 1)}
                          className="rounded-lg p-2 text-[#A7B3AA] hover:bg-[#29382F] disabled:opacity-30"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Remove highlight"
                          onClick={() =>
                            setAbout((current) => ({
                              ...current,
                              highlights: current.highlights.filter(
                                (_, i) => i !== index,
                              ),
                            }))
                          }
                          className="rounded-lg p-2 text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Label">
                        <input
                          className={inputClass}
                          value={item.label}
                          onChange={(e) =>
                            updateHighlight(index, "label", e.target.value)
                          }
                          maxLength={100}
                          placeholder="e.g. Certification"
                          required
                        />
                      </Field>
                      <Field label="Achievement">
                        <input
                          className={inputClass}
                          value={item.value}
                          onChange={(e) =>
                            updateHighlight(index, "value", e.target.value)
                          }
                          maxLength={250}
                          placeholder="e.g. AWS Cloud Practitioner"
                          required
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={panelClass}>
            <div className="mb-5">
              <h2 className="text-lg font-semibold">Strengths, values & interests</h2>
              <p className="mt-1 text-sm text-[#A7B3AA]">
                Explain the qualities, principles, and interests that shape you.
              </p>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => addStrength(category.value)}
                  disabled={about.strengths.length >= 100}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#29382F] bg-[#101713] px-3 py-2 text-sm text-[#D5DED7] transition hover:border-[#34D399]/50 hover:text-[#6EE7B7] disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Add {category.label.toLowerCase()}
                </button>
              ))}
            </div>

            {about.strengths.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#47554B] px-4 py-8 text-center text-sm text-[#A7B3AA]">
                Add strengths, values, or interests to personalize your profile.
              </div>
            ) : (
              <div className="space-y-4">
                {about.strengths.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-[#29382F] bg-[#101713]/70 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#6EE7B7]">
                        Item {index + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="Move up"
                          disabled={index === 0}
                          onClick={() => moveStrength(index, -1)}
                          className="rounded-lg p-2 text-[#A7B3AA] hover:bg-[#29382F] disabled:opacity-30"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Move down"
                          disabled={index === about.strengths.length - 1}
                          onClick={() => moveStrength(index, 1)}
                          className="rounded-lg p-2 text-[#A7B3AA] hover:bg-[#29382F] disabled:opacity-30"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Remove item"
                          onClick={() =>
                            setAbout((current) => ({
                              ...current,
                              strengths: current.strengths.filter(
                                (_, i) => i !== index,
                              ),
                            }))
                          }
                          className="rounded-lg p-2 text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Title">
                        <input
                          className={inputClass}
                          value={item.title}
                          onChange={(e) =>
                            updateStrength(index, "title", e.target.value)
                          }
                          maxLength={100}
                          placeholder="e.g. Problem solving"
                          required
                        />
                      </Field>
                      <Field label="Category">
                        <select
                          className={inputClass}
                          value={item.category}
                          onChange={(e) =>
                            updateStrength(index, "category", e.target.value)
                          }
                        >
                          {categories.map((category) => (
                            <option
                              key={category.value}
                              value={category.value}
                            >
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <div className="md:col-span-2">
                        <Field label="Description (optional)">
                          <textarea
                            className={`${inputClass} min-h-20 resize-y`}
                            value={item.description}
                            onChange={(e) =>
                              updateStrength(
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                            maxLength={1000}
                            placeholder="Briefly describe this quality or interest..."
                          />
                        </Field>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="flex flex-col-reverse justify-between gap-4 border-t border-[#29382F] pt-6 sm:flex-row sm:items-center">
            <p className="text-xs leading-5 text-[#A7B3AA]">
              Remember to save your changes. Hidden content should be excluded
              from the public About section.
            </p>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#34D399] px-6 py-3 text-sm font-semibold text-[#062C20] transition hover:bg-[#6EE7B7] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving changes..." : "Save About section"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
