"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Award,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { ImageUpload } from "@/components/admin/image-upload";

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
  createdAt?: string;
  updatedAt?: string;
};

type CertificateForm = {
  title: string;
  issuer: string;
  description: string;
  issueDate: string;
  expirationDate: string;
  credentialId: string;
  credentialUrl: string;
  imageUrl: string;
  documentUrl: string;
  skills: string;
  isVisible: boolean;
  isFeatured: boolean;
  sortOrder: number;
};

type FilterType = "all" | "visible" | "hidden" | "featured";

const emptyForm: CertificateForm = {
  title: "",
  issuer: "",
  description: "",
  issueDate: new Date().toISOString().slice(0, 10),
  expirationDate: "",
  credentialId: "",
  credentialUrl: "",
  imageUrl: "",
  documentUrl: "",
  skills: "",
  isVisible: true,
  isFeatured: false,
  sortOrder: 0,
};

const inputClass =
  "w-full rounded-xl border border-[#29382F] bg-[#101713] px-4 py-3 text-sm text-[#F5F5F0] outline-none transition placeholder:text-[#718078] focus:border-[#34D399] focus:ring-2 focus:ring-[#34D399]/10";

const labelClass =
  "mb-2 block text-sm font-medium text-[#DCE5DE]";

function toDateInput(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value?: string | null) {
  if (!value) return "No expiration";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

async function readResponse(response: Response) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload.error || payload.message || "Something went wrong.",
    );
  }

  return payload;
}

function getCertificateList(payload: unknown): Certificate[] {
  if (Array.isArray(payload)) return payload as Certificate[];

  if (payload && typeof payload === "object") {
    const data = payload as {
      certificates?: Certificate[];
      data?: Certificate[];
    };

    if (Array.isArray(data.certificates)) return data.certificates;
    if (Array.isArray(data.data)) return data.data;
  }

  return [];
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [form, setForm] = useState<CertificateForm>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadCertificates = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/certificates", {
        method: "GET",
        cache: "no-store",
      });

      const payload = await readResponse(response);
      setCertificates(getCertificateList(payload));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load certificates.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  const stats = useMemo(
    () => ({
      total: certificates.length,
      visible: certificates.filter((item) => item.isVisible).length,
      featured: certificates.filter((item) => item.isFeatured).length,
    }),
    [certificates],
  );

  const filteredCertificates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return certificates.filter((certificate) => {
      const matchesSearch =
        !query ||
        certificate.title.toLowerCase().includes(query) ||
        certificate.issuer.toLowerCase().includes(query) ||
        certificate.credentialId?.toLowerCase().includes(query) ||
        certificate.skills.some((skill) =>
          skill.toLowerCase().includes(query),
        );

      const matchesFilter =
        filter === "all" ||
        (filter === "visible" && certificate.isVisible) ||
        (filter === "hidden" && !certificate.isVisible) ||
        (filter === "featured" && certificate.isFeatured);

      return matchesSearch && matchesFilter;
    });
  }, [certificates, search, filter]);

  function updateForm<K extends keyof CertificateForm>(
    key: K,
    value: CertificateForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function startCreate() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      issueDate: new Date().toISOString().slice(0, 10),
    });
    setError("");
    setNotice("");
    setShowForm(true);
  }

  function startEdit(certificate: Certificate) {
    setEditingId(certificate.id);

    setForm({
      title: certificate.title,
      issuer: certificate.issuer,
      description: certificate.description || "",
      issueDate: toDateInput(certificate.issueDate),
      expirationDate: toDateInput(certificate.expirationDate),
      credentialId: certificate.credentialId || "",
      credentialUrl: certificate.credentialUrl || "",
      imageUrl: certificate.imageUrl || "",
      documentUrl: certificate.documentUrl || "",
      skills: certificate.skills.join(", "),
      isVisible: certificate.isVisible,
      isFeatured: certificate.isFeatured,
      sortOrder: certificate.sortOrder,
    });

    setError("");
    setNotice("");
    setShowForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!form.title.trim() || !form.issuer.trim()) {
      setError("Certificate title and issuing organization are required.");
      return;
    }

    if (!form.issueDate) {
      setError("Please select the issue date.");
      return;
    }

    if (
      form.expirationDate &&
      form.expirationDate < form.issueDate
    ) {
      setError("Expiration date cannot be before the issue date.");
      return;
    }

    const skills = form.skills
      .split(/[,\\n]/)
      .map((skill) => skill.trim())
      .filter(Boolean);

    const payload = {
      title: form.title.trim(),
      issuer: form.issuer.trim(),
      description: form.description.trim() || null,
      issueDate: form.issueDate,
      expirationDate: form.expirationDate || null,
      credentialId: form.credentialId.trim() || null,
      credentialUrl: form.credentialUrl.trim() || null,
      imageUrl: form.imageUrl || null,
      documentUrl: form.documentUrl.trim() || null,
      skills,
      isVisible: form.isVisible,
      isFeatured: form.isFeatured,
      sortOrder: Number(form.sortOrder) || 0,
    };

    setSaving(true);

    try {
      const response = await fetch("/api/certificates", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingId ? { ...payload, id: editingId } : payload,
        ),
      });

      await readResponse(response);

      setNotice(
        editingId
          ? "Certificate updated successfully."
          : "Certificate created successfully.",
      );

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadCertificates();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save certificate.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this certificate? This action cannot be undone.",
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/certificates?id=${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );

      await readResponse(response);

      setCertificates((current) =>
        current.filter((certificate) => certificate.id !== id),
      );

      setNotice("Certificate deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete certificate.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#101713] px-4 py-8 text-[#F5F5F0] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page heading */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#6EE7B7]">
              <Award className="h-4 w-4" />
              Portfolio management
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[#F5F5F0] sm:text-4xl">
              Certificates
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#A7B3AA]">
              Manage your professional certifications, achievements,
              credentials, and supporting documents.
            </p>
          </div>

          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#34D399] px-5 py-3 text-sm font-semibold text-[#062C20] transition hover:bg-[#6EE7B7] hover:shadow-lg hover:shadow-[#34D399]/10"
          >
            <Plus className="h-4 w-4" />
            Add certificate
          </button>
        </div>

        {/* Feedback */}
        {notice && (
          <div className="flex items-center gap-3 rounded-xl border border-[#34D399]/20 bg-[#34D399]/10 px-4 py-3 text-sm text-[#6EE7B7]">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            {notice}
            <button
              type="button"
              onClick={() => setNotice("")}
              className="ml-auto rounded-lg p-1 hover:bg-white/5"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <ShieldCheck className="h-5 w-5 shrink-0" />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto rounded-lg p-1 hover:bg-white/5"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Total certificates"
            value={stats.total}
            icon={<Award className="h-5 w-5" />}
          />
          <SummaryCard
            label="Visible certificates"
            value={stats.visible}
            icon={<Eye className="h-5 w-5" />}
          />
          <SummaryCard
            label="Featured certificates"
            value={stats.featured}
            icon={<Sparkles className="h-5 w-5" />}
          />
        </div>

        {/* Certificate form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-2xl border border-[#29382F] bg-[#17221B]"
          >
            <div className="flex items-center justify-between border-b border-[#29382F] px-5 py-5 sm:px-7">
              <div>
                <h2 className="text-lg font-semibold text-[#F5F5F0]">
                  {editingId ? "Edit certificate" : "Create certificate"}
                </h2>
                <p className="mt-1 text-sm text-[#A7B3AA]">
                  Enter the certificate information below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg p-2 text-[#A7B3AA] transition hover:bg-[#29382F] hover:text-white disabled:opacity-50"
                aria-label="Close form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-7 p-5 sm:p-7">
              {/* Basic information */}
              <section>
                <SectionHeading
                  title="Basic information"
                  description="The main details visitors will see."
                />

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      Certificate title *
                    </label>
                    <input
                      value={form.title}
                      onChange={(e) =>
                        updateForm("title", e.target.value)
                      }
                      placeholder="e.g. Full Stack Web Development"
                      className={inputClass}
                      required
                      maxLength={180}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Issuing organization *
                    </label>
                    <input
                      value={form.issuer}
                      onChange={(e) =>
                        updateForm("issuer", e.target.value)
                      }
                      placeholder="e.g. Google, Microsoft, Coursera"
                      className={inputClass}
                      required
                      maxLength={150}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) =>
                        updateForm("description", e.target.value)
                      }
                      placeholder="Briefly describe what this certificate represents..."
                      rows={4}
                      className={`${inputClass} resize-y`}
                    />
                  </div>
                </div>
              </section>

              <div className="border-t border-[#29382F]" />

              {/* Dates */}
              <section>
                <SectionHeading
                  title="Certificate dates"
                  description="Specify when the certificate was issued and whether it expires."
                />

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      <CalendarDays className="mr-2 inline h-4 w-4 text-[#34D399]" />
                      Issue date *
                    </label>
                    <input
                      type="date"
                      value={form.issueDate}
                      onChange={(e) =>
                        updateForm("issueDate", e.target.value)
                      }
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <CalendarDays className="mr-2 inline h-4 w-4 text-[#34D399]" />
                      Expiration date
                    </label>
                    <input
                      type="date"
                      value={form.expirationDate}
                      onChange={(e) =>
                        updateForm("expirationDate", e.target.value)
                      }
                      min={form.issueDate || undefined}
                      className={inputClass}
                    />
                    <p className="mt-2 text-xs text-[#718078]">
                      Leave empty if this certificate does not expire.
                    </p>
                  </div>
                </div>
              </section>

              <div className="border-t border-[#29382F]" />

              {/* Credentials */}
              <section>
                <SectionHeading
                  title="Credential details"
                  description="Optional verification information."
                />

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      Credential ID
                    </label>
                    <input
                      value={form.credentialId}
                      onChange={(e) =>
                        updateForm("credentialId", e.target.value)
                      }
                      placeholder="e.g. ABC-123-XYZ"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Credential verification URL
                    </label>
                    <input
                      type="url"
                      value={form.credentialUrl}
                      onChange={(e) =>
                        updateForm("credentialUrl", e.target.value)
                      }
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Document URL
                    </label>
                    <input
                      type="url"
                      value={form.documentUrl}
                      onChange={(e) =>
                        updateForm("documentUrl", e.target.value)
                      }
                      placeholder="Paste a link to the certificate PDF or document"
                      className={inputClass}
                    />
                    <p className="mt-2 text-xs text-[#718078]">
                      Add a document link if you want visitors to access
                      the original certificate file.
                    </p>
                  </div>
                </div>
              </section>

              <div className="border-t border-[#29382F]" />

              {/* Certificate image */}
              <section>
                <SectionHeading
                  title="Certificate image"
                  description="Upload a certificate image or preview using your existing Cloudinary uploader."
                />

                <div className="mt-5 max-w-xl">
                  <ImageUpload
                    section="certificates"
                    value={form.imageUrl || null}
                    publicId={null}
                    label="Certificate image"
                   onChange={({ url }) =>
  updateForm("imageUrl", url ?? "")
}
                  />
                </div>
              </section>

              <div className="border-t border-[#29382F]" />

              {/* Skills */}
              <section>
                <SectionHeading
                  title="Related skills"
                  description="Add skills associated with this certificate."
                />

                <div className="mt-5">
                  <label className={labelClass}>
                    Skills
                  </label>
                  <input
                    value={form.skills}
                    onChange={(e) =>
                      updateForm("skills", e.target.value)
                    }
                    placeholder="React, TypeScript, UI Design"
                    className={inputClass}
                  />
                  <p className="mt-2 text-xs text-[#718078]">
                    Separate skills with commas.
                  </p>
                </div>
              </section>

              <div className="border-t border-[#29382F]" />

              {/* Publishing settings */}
              <section>
                <SectionHeading
                  title="Publishing settings"
                  description="Control how this certificate appears on your public portfolio."
                />

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <ToggleOption
                    checked={form.isVisible}
                    onChange={(value) =>
                      updateForm("isVisible", value)
                    }
                    title="Visible on portfolio"
                    description="Allow visitors to see this certificate."
                    icon={<Eye className="h-5 w-5" />}
                  />

                  <ToggleOption
                    checked={form.isFeatured}
                    onChange={(value) =>
                      updateForm("isFeatured", value)
                    }
                    title="Featured certificate"
                    description="Highlight this certificate on your portfolio."
                    icon={<Sparkles className="h-5 w-5" />}
                  />
                </div>

                <div className="mt-5 max-w-xs">
                  <label className={labelClass}>
                    Display order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.sortOrder}
                    onChange={(e) =>
                      updateForm("sortOrder", Number(e.target.value))
                    }
                    className={inputClass}
                  />
                  <p className="mt-2 text-xs text-[#718078]">
                    Lower numbers appear first.
                  </p>
                </div>
              </section>
            </div>

            {/* Form actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-[#29382F] bg-[#101713]/50 px-5 py-5 sm:flex-row sm:justify-end sm:px-7">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-xl border border-[#29382F] px-5 py-3 text-sm font-medium text-[#A7B3AA] transition hover:bg-[#29382F] hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#34D399] px-6 py-3 text-sm font-semibold text-[#062C20] transition hover:bg-[#6EE7B7] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update certificate"
                    : "Save certificate"}
              </button>
            </div>
          </form>
        )}

        {/* Search and filters */}
        <div className="rounded-2xl border border-[#29382F] bg-[#17221B] p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718078]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search certificates, issuers, skills..."
                className={`${inputClass} pl-11`}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", "All"],
                  ["visible", "Visible"],
                  ["hidden", "Hidden"],
                  ["featured", "Featured"],
                ] as [FilterType, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    filter === value
                      ? "bg-[#34D399] text-[#062C20]"
                      : "border border-[#29382F] bg-[#101713] text-[#A7B3AA] hover:border-[#34D399]/40 hover:text-[#F5F5F0]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Certificate list */}
        <div>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#F5F5F0]">
                Your certificates
              </h2>
              <p className="mt-1 text-sm text-[#A7B3AA]">
                {filteredCertificates.length}{" "}
                {filteredCertificates.length === 1
                  ? "certificate"
                  : "certificates"}{" "}
                found
              </p>
            </div>

            <button
              type="button"
              onClick={loadCertificates}
              disabled={loading}
              className="rounded-lg border border-[#29382F] px-3 py-2 text-xs font-medium text-[#A7B3AA] transition hover:bg-[#17221B] hover:text-white disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex min-h-56 items-center justify-center rounded-2xl border border-[#29382F] bg-[#17221B]">
              <div className="flex items-center gap-3 text-sm text-[#A7B3AA]">
                <Loader2 className="h-5 w-5 animate-spin text-[#34D399]" />
                Loading certificates...
              </div>
            </div>
          ) : filteredCertificates.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-[#35483B] bg-[#17221B]/60 px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#34D399]/10 text-[#34D399]">
                <Award className="h-8 w-8" />
              </div>

              <h3 className="text-lg font-semibold text-[#F5F5F0]">
                {certificates.length === 0
                  ? "No certificates yet"
                  : "No matching certificates"}
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-[#A7B3AA]">
                {certificates.length === 0
                  ? "Add your professional certificates and achievements to strengthen your portfolio."
                  : "Try another search term or change the selected filter."}
              </p>

              {certificates.length === 0 && (
                <button
                  type="button"
                  onClick={startCreate}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#34D399] px-5 py-3 text-sm font-semibold text-[#062C20] transition hover:bg-[#6EE7B7]"
                >
                  <Plus className="h-4 w-4" />
                  Add your first certificate
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredCertificates.map((certificate) => (
                <article
                  key={certificate.id}
                  className="group overflow-hidden rounded-2xl border border-[#29382F] bg-[#17221B] transition duration-300 hover:-translate-y-1 hover:border-[#34D399]/40 hover:shadow-xl hover:shadow-black/10"
                >
                  {/* Image */}
                  <div className="relative flex h-44 items-center justify-center overflow-hidden bg-[#101713]">
                    {certificate.imageUrl ? (
                      <img
                        src={certificate.imageUrl}
                        alt={certificate.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-[#718078]">
                        <FileText className="h-10 w-10" />
                        <span className="text-xs">
                          No certificate image
                        </span>
                      </div>
                    )}

                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      {certificate.isFeatured && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#34D399]/20 bg-[#101713]/90 px-2.5 py-1 text-[10px] font-semibold text-[#6EE7B7] backdrop-blur">
                          <Sparkles className="h-3 w-3" />
                          Featured
                        </span>
                      )}

                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold backdrop-blur ${
                          certificate.isVisible
                            ? "border-[#34D399]/20 bg-[#101713]/90 text-[#6EE7B7]"
                            : "border-white/10 bg-[#101713]/90 text-[#A7B3AA]"
                        }`}
                      >
                        {certificate.isVisible ? (
                          <Eye className="h-3 w-3" />
                        ) : (
                          <EyeOff className="h-3 w-3" />
                        )}
                        {certificate.isVisible ? "Visible" : "Hidden"}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-4 p-5">
                    <div>
                      <h3 className="line-clamp-2 text-base font-semibold leading-6 text-[#F5F5F0]">
                        {certificate.title}
                      </h3>
                      <p className="mt-1 text-sm text-[#6EE7B7]">
                        {certificate.issuer}
                      </p>
                    </div>

                    <div className="space-y-2 text-xs text-[#A7B3AA]">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 shrink-0 text-[#718078]" />
                        <span>
                          Issued: {formatDate(certificate.issueDate)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 shrink-0 text-[#718078]" />
                        <span>
                          Expires: {formatDate(certificate.expirationDate)}
                        </span>
                      </div>

                      {certificate.credentialId && (
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 shrink-0 text-[#718078]" />
                          <span className="truncate">
                            ID: {certificate.credentialId}
                          </span>
                        </div>
                      )}
                    </div>

                    {certificate.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {certificate.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md border border-[#29382F] bg-[#101713] px-2 py-1 text-[10px] text-[#A7B3AA]"
                          >
                            {skill}
                          </span>
                        ))}
                        {certificate.skills.length > 4 && (
                          <span className="rounded-md border border-[#29382F] bg-[#101713] px-2 py-1 text-[10px] text-[#A7B3AA]">
                            +{certificate.skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Links */}
                    {(certificate.credentialUrl ||
                      certificate.documentUrl) && (
                      <div className="flex flex-wrap gap-3 border-t border-[#29382F] pt-3">
                        {certificate.credentialUrl && (
                          <a
                            href={certificate.credentialUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6EE7B7] transition hover:text-white"
                          >
                            Verify
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}

                        {certificate.documentUrl && (
                          <a
                            href={certificate.documentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6EE7B7] transition hover:text-white"
                          >
                            Document
                            <FileText className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 border-t border-[#29382F] pt-4">
                      <button
                        type="button"
                        onClick={() => startEdit(certificate)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#29382F] bg-[#101713] px-3 py-2.5 text-xs font-semibold text-[#DCE5DE] transition hover:border-[#34D399]/40 hover:text-[#6EE7B7]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(certificate.id)}
                        disabled={deletingId === certificate.id}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {deletingId === certificate.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
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
    <div className="rounded-2xl border border-[#29382F] bg-[#17221B] p-5 transition hover:border-[#34D399]/30">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#A7B3AA]">{label}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#34D399]/10 text-[#34D399]">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold tabular-nums text-[#F5F5F0]">
        {value}
      </p>
    </div>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h3 className="text-base font-semibold text-[#F5F5F0]">
        {title}
      </h3>
      <p className="mt-1 text-sm text-[#A7B3AA]">
        {description}
      </p>
    </div>
  );
}

function ToggleOption({
  checked,
  onChange,
  title,
  description,
  icon,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
        checked
          ? "border-[#34D399]/40 bg-[#34D399]/5"
          : "border-[#29382F] bg-[#101713] hover:border-[#34D399]/20"
      }`}
    >
      <div
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          checked
            ? "bg-[#34D399]/15 text-[#6EE7B7]"
            : "bg-[#29382F] text-[#A7B3AA]"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#F5F5F0]">
          {title}
        </p>
        <p className="mt-1 text-xs leading-5 text-[#A7B3AA]">
          {description}
        </p>
      </div>

      <span
        className={`relative mt-1 h-5 w-9 shrink-0 rounded-full transition ${
          checked ? "bg-[#34D399]" : "bg-[#46534B]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}