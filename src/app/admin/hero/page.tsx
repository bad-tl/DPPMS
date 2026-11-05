"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Image as ImageIcon,
  LoaderCircle,
  Save,
} from "lucide-react";

import { ImageUpload } from "@/components/admin/image-upload";

type HeroFormData = {
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

const initialForm: HeroFormData = {
  fullName: "",
  professionalTitle: "",
  headline: "",
  description: "",
  profileImage: null,
  profileImagePublicId: null,
  primaryButtonText: "View My Projects",
  primaryButtonLink: "#projects",
  secondaryButtonText: "Contact Me",
  secondaryButtonLink: "#contact",
};

const inputClass =
  "mt-2 w-full rounded-xl border border-[#29382F] bg-[#101713] px-4 py-3 text-sm text-[#F5F7F5] outline-none transition placeholder:text-[#718078] focus:border-[#34D399] focus:ring-2 focus:ring-[#34D399]/15";

const labelClass = "text-sm font-medium text-[#D2DED5]";

function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>

      <input
        className={inputClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
      />
    </label>
  );
}

export default function HeroAdminPage() {
  const [form, setForm] = useState<HeroFormData>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField<K extends keyof HeroFormData>(
    field: K,
    value: HeroFormData[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccess("");
  }

  useEffect(() => {
    let cancelled = false;

    async function loadHero() {
      try {
        const response = await fetch("/api/hero");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Could not load Hero content.",
          );
        }

        if (!cancelled && result.hero) {
          setForm({
            fullName: result.hero.fullName ?? "",
            professionalTitle:
              result.hero.professionalTitle ?? "",
            headline: result.hero.headline ?? "",
            description: result.hero.description ?? "",
            profileImage: result.hero.profileImage ?? null,
            profileImagePublicId:
              result.hero.profileImagePublicId ?? null,
            primaryButtonText:
              result.hero.primaryButtonText ??
              initialForm.primaryButtonText,
            primaryButtonLink:
              result.hero.primaryButtonLink ??
              initialForm.primaryButtonLink,
            secondaryButtonText:
              result.hero.secondaryButtonText ??
              initialForm.secondaryButtonText,
            secondaryButtonLink:
              result.hero.secondaryButtonLink ??
              initialForm.secondaryButtonLink,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load Hero content.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadHero();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/hero", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Could not save Hero content.",
        );
      }

      setForm({
        fullName: result.hero.fullName ?? "",
        professionalTitle:
          result.hero.professionalTitle ?? "",
        headline: result.hero.headline ?? "",
        description: result.hero.description ?? "",
        profileImage: result.hero.profileImage ?? null,
        profileImagePublicId:
          result.hero.profileImagePublicId ?? null,
        primaryButtonText:
          result.hero.primaryButtonText ??
          initialForm.primaryButtonText,
        primaryButtonLink:
          result.hero.primaryButtonLink ??
          initialForm.primaryButtonLink,
        secondaryButtonText:
          result.hero.secondaryButtonText ??
          initialForm.secondaryButtonText,
        secondaryButtonLink:
          result.hero.secondaryButtonLink ??
          initialForm.secondaryButtonLink,
      });

      setSuccess("Hero content saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[#A7B3AA]">
        <LoaderCircle className="mr-3 size-5 animate-spin" />
        Loading Hero settings...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 pb-12">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/admin"
            className="mb-4 inline-flex items-center gap-2 text-sm text-[#A7B3AA] transition hover:text-[#6EE7B7]"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>

          <h1 className="text-2xl font-semibold tracking-tight text-[#F5F7F5] sm:text-3xl">
            Hero Section
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#A7B3AA]">
            Manage the first section visitors see on your public
            portfolio.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#29382F] px-4 py-2.5 text-sm font-medium text-[#D2DED5] transition hover:border-[#34D399] hover:text-[#6EE7B7]"
        >
          <Eye className="size-4" />
          Preview Public Site
        </Link>
      </div>

      {/* Feedback messages */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200"
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Introduction */}
        <section className="rounded-2xl border border-[#29382F] bg-[#17221B] p-5 sm:p-7">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#F5F7F5]">
              Introduction
            </h2>

            <p className="mt-1 text-sm text-[#A7B3AA]">
              Your name and professional introduction.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Full Name"
              value={form.fullName}
              onChange={(value) =>
                updateField("fullName", value)
              }
              placeholder="e.g. Biniam Bekele"
              required
              maxLength={100}
            />

            <Field
              label="Professional Title"
              value={form.professionalTitle}
              onChange={(value) =>
                updateField("professionalTitle", value)
              }
              placeholder="e.g. Full-Stack Developer"
              required
              maxLength={150}
            />

            <div className="sm:col-span-2">
              <Field
                label="Headline"
                value={form.headline}
                onChange={(value) =>
                  updateField("headline", value)
                }
                placeholder="e.g. Building digital experiences that matter."
                required
                maxLength={200}
              />
            </div>

            <label className="block sm:col-span-2">
              <span className={labelClass}>Description</span>

              <textarea
                className={`${inputClass} min-h-36 resize-y`}
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Introduce yourself, your expertise, and what you do."
                required
                maxLength={2000}
              />

              <span className="mt-2 block text-right text-xs text-[#A7B3AA]">
                {form.description.length}/2000
              </span>
            </label>
          </div>
        </section>

        {/* Profile image / Cloudinary upload */}
        <section className="rounded-2xl border border-[#29382F] bg-[#17221B] p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[#34D399]/10 p-3 text-[#34D399]">
              <ImageIcon className="size-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#F5F7F5]">
                Profile Image
              </h2>

              <p className="mt-1 text-sm text-[#A7B3AA]">
                Upload and manage your public Hero profile image.
              </p>
            </div>
          </div>

          <ImageUpload
            section="hero"
            label="Hero Profile Image"
            value={form.profileImage}
            publicId={form.profileImagePublicId}
            onChange={({ url, publicId }) => {
              setForm((current) => ({
                ...current,
                profileImage: url,
                profileImagePublicId: publicId,
              }));

              setError("");
              setSuccess("");
            }}
          />

          <p className="mt-3 text-xs leading-5 text-[#A7B3AA]">
            Supported formats: JPG, PNG, WebP, and AVIF. Maximum
            file size: 5 MB. Your uploaded image URL and Cloudinary
            public ID will be saved with your Hero content when you
            click Save Hero Content.
          </p>
        </section>

        {/* Call-to-action buttons */}
        <section className="rounded-2xl border border-[#29382F] bg-[#17221B] p-5 sm:p-7">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#F5F7F5]">
              Call-to-Action Buttons
            </h2>

            <p className="mt-1 text-sm text-[#A7B3AA]">
              Configure the text and destination of your two Hero
              buttons.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Primary Button Text"
              value={form.primaryButtonText}
              onChange={(value) =>
                updateField("primaryButtonText", value)
              }
              placeholder="View My Projects"
              required
              maxLength={50}
            />

            <Field
              label="Primary Button Link"
              value={form.primaryButtonLink}
              onChange={(value) =>
                updateField("primaryButtonLink", value)
              }
              placeholder="#projects"
              required
              maxLength={500}
            />

            <Field
              label="Secondary Button Text"
              value={form.secondaryButtonText}
              onChange={(value) =>
                updateField("secondaryButtonText", value)
              }
              placeholder="Contact Me"
              required
              maxLength={50}
            />

            <Field
              label="Secondary Button Link"
              value={form.secondaryButtonLink}
              onChange={(value) =>
                updateField("secondaryButtonLink", value)
              }
              placeholder="#contact"
              required
              maxLength={500}
            />
          </div>
        </section>

        {/* Form actions */}
        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => window.location.reload()}
            disabled={saving}
            className="rounded-xl border border-[#29382F] px-5 py-3 text-sm font-medium text-[#D2DED5] transition hover:bg-[#29382F] disabled:opacity-50"
          >
            Discard Changes
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#34D399] px-6 py-3 text-sm font-semibold text-[#062C20] transition hover:bg-[#6EE7B7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}

            {saving ? "Saving..." : "Save Hero Content"}
          </button>
        </div>
      </form>
    </div>
  );
}