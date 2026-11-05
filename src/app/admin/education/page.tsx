
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GraduationCap,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { ImageUpload } from "@/components/admin/image-upload";

type EducationRecord = {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  isCurrentlyStudying: boolean;
  grade: string | null;
  institutionLogo: string | null;
  institutionLogoPublicId: string | null;
  isVisible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type EducationForm = {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  description: string;
  startDate: string;
  endDate: string;
  isCurrentlyStudying: boolean;
  grade: string;
  institutionLogo: string | null;
  institutionLogoPublicId: string | null;
  isVisible: boolean;
  sortOrder: number;
};

const emptyForm: EducationForm = {
  institution: "",
  degree: "",
  fieldOfStudy: "",
  description: "",
  startDate: "",
  endDate: "",
  isCurrentlyStudying: false,
  grade: "",
  institutionLogo: null,
  institutionLogoPublicId: null,
  isVisible: true,
  sortOrder: 0,
};

function dateInputValue(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export default function EducationAdminPage() {
  const [records, setRecords] = useState<EducationRecord[]>([]);
  const [form, setForm] = useState<EducationForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const loadEducation = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/education", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load education records.");
      }

      setRecords(result.education ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEducation();
  }, [loadEducation]);

  function updateForm<K extends keyof EducationForm>(
    key: K,
    value: EducationForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openCreateForm() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      sortOrder: records.length,
    });
    setError("");
    setNotice("");
    setFormOpen(true);
  }

  function openEditForm(record: EducationRecord) {
    setEditingId(record.id);
    setForm({
      institution: record.institution,
      degree: record.degree,
      fieldOfStudy: record.fieldOfStudy,
      description: record.description ?? "",
      startDate: dateInputValue(record.startDate),
      endDate: dateInputValue(record.endDate),
      isCurrentlyStudying: record.isCurrentlyStudying,
      grade: record.grade ?? "",
      institutionLogo: record.institutionLogo,
      institutionLogoPublicId: record.institutionLogoPublicId,
      isVisible: record.isVisible,
      sortOrder: record.sortOrder,
    });
    setError("");
    setNotice("");
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    if (!form.startDate) {
      setError("Please select a start date.");
      setSaving(false);
      return;
    }

    if (
      !form.isCurrentlyStudying &&
      form.endDate &&
      form.endDate < form.startDate
    ) {
      setError("End date cannot be earlier than start date.");
      setSaving(false);
      return;
    }

    const payload = {
      institution: form.institution.trim(),
      degree: form.degree.trim(),
      fieldOfStudy: form.fieldOfStudy.trim(),
      description: form.description.trim() || null,
      startDate: new Date(`${form.startDate}T00:00:00.000Z`).toISOString(),
      endDate:
        form.isCurrentlyStudying || !form.endDate
          ? null
          : new Date(`${form.endDate}T00:00:00.000Z`).toISOString(),
      isCurrentlyStudying: form.isCurrentlyStudying,
      grade: form.grade.trim() || null,
      institutionLogo: form.institutionLogo,
      institutionLogoPublicId: form.institutionLogoPublicId,
      isVisible: form.isVisible,
      sortOrder: Math.max(0, Math.trunc(form.sortOrder)),
    };

    try {
      const response = await fetch("/api/education", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingId ? { ...payload, id: editingId } : payload,
        ),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save education record.");
      }

      await loadEducation();
      closeForm();
      setNotice(
        editingId
          ? "Education record updated successfully."
          : "Education record created successfully.",
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord(record: EducationRecord) {
    const confirmed = window.confirm(
      `Delete "${record.degree}" at "${record.institution}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(record.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/education", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: record.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete education record.");
      }

      setRecords((current) =>
        current.filter((item) => item.id !== record.id),
      );

      if (editingId === record.id) closeForm();

      setNotice("Education record deleted successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  async function changeOrder(record: EducationRecord, direction: -1 | 1) {
    const sorted = [...records].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
    const index = sorted.findIndex((item) => item.id === record.id);
    const targetIndex = index + direction;

    if (index < 0 || targetIndex < 0 || targetIndex >= sorted.length) {
      return;
    }

    const target = sorted[targetIndex];
    setError("");
    setNotice("");

    try {
      const [firstResponse, secondResponse] = await Promise.all([
        fetch("/api/education", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: record.id,
            sortOrder: target.sortOrder,
          }),
        }),
        fetch("/api/education", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: target.id,
            sortOrder: record.sortOrder,
          }),
        }),
      ]);

      if (!firstResponse.ok || !secondResponse.ok) {
        throw new Error("Could not update the education order.");
      }

      await loadEducation();
      setNotice("Education order updated.");
    } catch (err) {
      setError(getErrorMessage(err));
      await loadEducation();
    }
  }

  return (
    <main className="min-h-screen bg-[#101713] px-4 py-6 text-[#F5F7F5] sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Page heading */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
              <GraduationCap className="size-6 text-[#34D399]" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6EE7B7]">
                Portfolio management
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Education
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#A7B3AA]">
                Manage your academic background and qualifications displayed
                on your portfolio.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#34D399] px-5 py-3 text-sm font-semibold text-[#062C20] transition hover:bg-[#6EE7B7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6EE7B7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101713]"
          >
            <Plus className="size-4" />
            Add education
          </button>
        </header>

        {/* Feedback */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200"
          >
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <p className="flex-1">{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-[#A7F3D0]"
          >
            <Check className="size-5 shrink-0" />
            <p className="flex-1">{notice}</p>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Summary */}
        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Total records"
            value={records.length}
            icon={<GraduationCap className="size-5" />}
          />
          <SummaryCard
            label="Visible publicly"
            value={records.filter((record) => record.isVisible).length}
            icon={<Eye className="size-5" />}
          />
          <SummaryCard
            label="Currently studying"
            value={
              records.filter((record) => record.isCurrentlyStudying).length
            }
            icon={<CalendarDays className="size-5" />}
          />
        </section>

        {/* Create / edit form */}
        {formOpen && (
          <section
            id="education-form"
            className="overflow-hidden rounded-2xl border border-[#29382F] bg-[#17221B] shadow-xl shadow-black/10"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#29382F] px-5 py-5 sm:px-7">
              <div>
                <h2 className="text-lg font-semibold">
                  {editingId ? "Edit education" : "Add education"}
                </h2>
                <p className="mt-1 text-sm text-[#A7B3AA]">
                  Enter your qualification details below.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Close form"
                className="rounded-lg p-2 text-[#A7B3AA] transition hover:bg-white/5 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7 p-5 sm:p-7">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Institution" required>
                  <input
                    required
                    maxLength={200}
                    value={form.institution}
                    onChange={(event) =>
                      updateForm("institution", event.target.value)
                    }
                    placeholder="e.g. Arsi University"
                    className={inputClass}
                  />
                </Field>

                <Field label="Degree / qualification" required>
                  <input
                    required
                    maxLength={150}
                    value={form.degree}
                    onChange={(event) =>
                      updateForm("degree", event.target.value)
                    }
                    placeholder="e.g. Bachelor of Science"
                    className={inputClass}
                  />
                </Field>

                <Field label="Field of study" required>
                  <input
                    required
                    maxLength={150}
                    value={form.fieldOfStudy}
                    onChange={(event) =>
                      updateForm("fieldOfStudy", event.target.value)
                    }
                    placeholder="e.g. Computer Science"
                    className={inputClass}
                  />
                </Field>

                <Field label="Grade / GPA">
                  <input
                    maxLength={100}
                    value={form.grade}
                    onChange={(event) =>
                      updateForm("grade", event.target.value)
                    }
                    placeholder="e.g. 3.75 GPA (optional)"
                    className={inputClass}
                  />
                </Field>

                <Field label="Start date" required>
                  <input
                    required
                    type="date"
                    value={form.startDate}
                    onChange={(event) =>
                      updateForm("startDate", event.target.value)
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="End date">
                  <input
                    type="date"
                    disabled={form.isCurrentlyStudying}
                    min={form.startDate || undefined}
                    value={form.endDate}
                    onChange={(event) =>
                      updateForm("endDate", event.target.value)
                    }
                    className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-40`}
                  />
                </Field>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#29382F] bg-[#101713]/60 p-4">
                <input
                  type="checkbox"
                  checked={form.isCurrentlyStudying}
                  onChange={(event) => {
                    updateForm("isCurrentlyStudying", event.target.checked);
                    if (event.target.checked) {
                      updateForm("endDate", "");
                    }
                  }}
                  className="mt-1 size-4 accent-[#34D399]"
                />
                <span>
                  <span className="block text-sm font-medium">
                    I am currently studying here
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[#A7B3AA]">
                    The end date will be cleared while this option is enabled.
                  </span>
                </span>
              </label>

              <Field label="Description">
                <textarea
                  rows={4}
                  maxLength={5000}
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  placeholder="Describe your studies, achievements, relevant coursework, or academic activities..."
                  className={`${inputClass} min-h-28 resize-y`}
                />
                <p className="mt-1 text-right text-xs text-[#A7B3AA]">
                  {form.description.length}/5000
                </p>
              </Field>

              <div className="space-y-3">
                <Field label="Institution logo">
                  <p className="mb-3 text-xs leading-5 text-[#A7B3AA]">
                    Upload a logo using the existing image uploader.
                  </p>
                  <ImageUpload
                    section="education"
                    value={form.institutionLogo ?? ""}
                    publicId={form.institutionLogoPublicId ?? ""}
                    onChange={(image) => {
                      updateForm("institutionLogo", image.url || null);
                      updateForm(
                        "institutionLogoPublicId",
                        image.publicId || null,
                      );
                    }}
                    label="Upload institution logo"
                  />
                </Field>
              </div>

              <div className="grid gap-5 border-t border-[#29382F] pt-6 sm:grid-cols-2">
                <Field label="Display order">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={form.sortOrder}
                    onChange={(event) =>
                      updateForm(
                        "sortOrder",
                        Math.max(0, Number(event.target.value) || 0),
                      )
                    }
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-[#A7B3AA]">
                    Lower numbers appear first.
                  </p>
                </Field>

                <div className="space-y-3">
                  <ToggleRow
                    checked={form.isVisible}
                    onChange={(checked) => updateForm("isVisible", checked)}
                    title="Show on public portfolio"
                    description="Hide this record without deleting it."
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#29382F] pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#35463B] px-5 py-3 text-sm font-medium text-[#D1D9D3] transition hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#34D399] px-5 py-3 text-sm font-semibold text-[#062C20] transition hover:bg-[#6EE7B7] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Create record"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Education records */}
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Your education</h2>
              <p className="mt-1 text-sm text-[#A7B3AA]">
                Manage your records and their display order.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadEducation()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#A7B3AA] transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              <LoaderCircle
                className={`size-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-[#29382F] bg-[#17221B]">
              <LoaderCircle className="size-7 animate-spin text-[#34D399]" />
              <p className="text-sm text-[#A7B3AA]">
                Loading education records...
              </p>
            </div>
          ) : records.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-[#35463B] bg-[#17221B]/60 px-6 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-[#34D399]/10">
                <GraduationCap className="size-7 text-[#34D399]" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">
                No education records yet
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#A7B3AA]">
                Add your university, degree, or other qualification to start
                building your academic profile.
              </p>
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#34D399] px-4 py-3 text-sm font-semibold text-[#062C20] transition hover:bg-[#6EE7B7]"
              >
                <Plus className="size-4" />
                Add your first record
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {[...records]
                .sort(
                  (a, b) =>
                    a.sortOrder - b.sortOrder ||
                    new Date(b.startDate).getTime() -
                      new Date(a.startDate).getTime(),
                )
                .map((record, index, sortedRecords) => (
                  <article
                    key={record.id}
                    className="rounded-2xl border border-[#29382F] bg-[#17221B] p-4 transition hover:border-[#405747] sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#35463B] bg-[#101713]">
                        {record.institutionLogo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={record.institutionLogo}
                            alt={`${record.institution} logo`}
                            className="size-full object-contain p-2"
                          />
                        ) : (
                          <GraduationCap className="size-6 text-[#6EE7B7]" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold">
                            {record.degree}
                          </h3>
                          {record.isCurrentlyStudying && (
                            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-[#6EE7B7]">
                              In progress
                            </span>
                          )}
                          {!record.isVisible && (
                            <span className="rounded-full border border-[#35463B] bg-[#101713] px-2.5 py-1 text-xs text-[#A7B3AA]">
                              Hidden
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-[#6EE7B7]">
                          {record.institution}
                        </p>
                        <p className="mt-1 text-sm text-[#D1D9D3]">
                          {record.fieldOfStudy}
                        </p>

                        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#A7B3AA]">
                          <CalendarDays className="size-3.5" />
                          <span>
                            {formatDate(record.startDate)} –{" "}
                            {record.isCurrentlyStudying
                              ? "Present"
                              : formatDate(record.endDate) || "Not specified"}
                          </span>
                          {record.grade && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{record.grade}</span>
                            </>
                          )}
                        </p>

                        {record.description && (
                          <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm leading-6 text-[#A7B3AA]">
                            {record.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <div className="flex items-center rounded-lg border border-[#35463B]">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => void changeOrder(record, -1)}
                            aria-label="Move education record up"
                            title="Move up"
                            className="rounded-l-lg p-2.5 text-[#A7B3AA] transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <ArrowUp className="size-4" />
                          </button>
                          <div className="h-5 border-l border-[#35463B]" />
                          <button
                            type="button"
                            disabled={index === sortedRecords.length - 1}
                            onClick={() => void changeOrder(record, 1)}
                            aria-label="Move education record down"
                            title="Move down"
                            className="rounded-r-lg p-2.5 text-[#A7B3AA] transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <ArrowDown className="size-4" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => openEditForm(record)}
                          aria-label={`Edit ${record.degree}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-[#35463B] px-3 py-2.5 text-sm text-[#D1D9D3] transition hover:bg-white/5 hover:text-white"
                        >
                          <Pencil className="size-4" />
                          <span className="sm:hidden lg:inline">Edit</span>
                        </button>

                        <button
                          type="button"
                          disabled={deletingId === record.id}
                          onClick={() => void deleteRecord(record)}
                          aria-label={`Delete ${record.degree}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-400/20 px-3 py-2.5 text-sm text-red-300 transition hover:bg-red-400/10 disabled:opacity-50"
                        >
                          {deletingId === record.id ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                          <span className="sm:hidden lg:inline">Delete</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          )}
        </section>

        <footer className="border-t border-[#29382F] pt-5 text-xs leading-5 text-[#A7B3AA]">
          Education records are saved to your account. Only records marked
          visible should be displayed on your public portfolio.
        </footer>
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#35463B] bg-[#101713] px-4 py-3 text-sm text-[#F5F7F5] outline-none placeholder:text-[#718077] transition focus:border-[#34D399] focus:ring-2 focus:ring-[#34D399]/10";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-medium text-[#D1D9D3]">
        {label}
        {required && <span className="ml-1 text-[#6EE7B7]">*</span>}
      </label>
      {children}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#29382F] bg-[#17221B] p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[#A7B3AA]">{label}</p>
        <span className="text-[#6EE7B7]">{icon}</span>
      </div>
      <p className="mt-4 text-3xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function ToggleRow({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[#29382F] bg-[#101713]/60 p-4">
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-[#A7B3AA]">
          {description}
        </span>
      </span>
      <span className="relative inline-flex shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span className="h-6 w-11 rounded-full bg-[#35463B] transition peer-checked:bg-[#34D399] peer-focus-visible:ring-2 peer-focus-visible:ring-[#6EE7B7] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#101713]" />
        <span className="absolute left-1 size-4 rounded-full bg-white transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
