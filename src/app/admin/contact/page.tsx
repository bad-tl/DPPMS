
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Save,
  Trash2,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaTelegram,
  FaFacebookF,
  FaInstagram,
} from "react-icons/fa";

type SocialLink = {
  id?: string;
  platform: string;
  label: string;
  url: string;
  isVisible: boolean;
  sortOrder: number;
};

type ContactProfile = {
  intro: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
};

type ContactResponse = {
  profile?: Partial<ContactProfile>;
  socialLinks?: SocialLink[];
  error?: string;
};

const EMPTY_PROFILE: ContactProfile = {
  intro:
    "Feel free to contact me anytime. I'm always happy to discuss new opportunities.",
  phone: "",
  email: "",
  address: "",
  workingHours: "",
};

const SOCIAL_PLATFORMS = [
  { value: "github", label: "GitHub" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "telegram", label: "Telegram" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X / Twitter" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "tiktok", label: "TikTok" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
];

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#101D16] px-4 py-3 text-sm text-[#F5F5F0] outline-none transition placeholder:text-[#718078] focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10";

const labelClass =
  "mb-2 block text-sm font-medium text-[#DCE8DF]";

function getPlatformIcon(platform: string) {
  switch (platform.toLowerCase()) {
    case "github":
      return FaGithub;
    case "linkedin":
      return FaLinkedin;
    case "telegram":
      return FaTelegram;
    case "facebook":
      return FaFacebookF;
    case "instagram":
      return FaInstagram;
    case "email":
      return FaEnvelope;
    case "whatsapp":
      return MessageCircle;
    case "website":
      return Globe;
    default:
      return ExternalLink;
  }
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return "";

  if (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://")
  ) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export default function AdminContactPage() {
  const [profile, setProfile] =
    useState<ContactProfile>(EMPTY_PROFILE);

  const [socialLinks, setSocialLinks] =
    useState<SocialLink[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const visibleCount = useMemo(
    () => socialLinks.filter((link) => link.isVisible).length,
    [socialLinks],
  );

  const loadContact = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        cache: "no-store",
      });

      const data: ContactResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load contact information.",
        );
      }

      setProfile({
        ...EMPTY_PROFILE,
        ...data.profile,
      });

      setSocialLinks(
        Array.isArray(data.socialLinks)
          ? data.socialLinks.map((link, index) => ({
              ...link,
              sortOrder: link.sortOrder ?? index,
              isVisible: link.isVisible ?? true,
            }))
          : [],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading contact information.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContact();
  }, [loadContact]);

  const updateProfile = (
    field: keyof ContactProfile,
    value: string,
  ) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccess("");
  };

  const addSocialLink = () => {
    const usedPlatforms = socialLinks.map(
      (link) => link.platform,
    );

    const availablePlatform = SOCIAL_PLATFORMS.find(
      (platform) => !usedPlatforms.includes(platform.value),
    );

    setSocialLinks((current) => [
      ...current,
      {
        platform: availablePlatform?.value || "other",
        label: "",
        url: "",
        isVisible: true,
        sortOrder: current.length,
      },
    ]);

    setSuccess("");
  };

  const updateSocialLink = (
    index: number,
    field: keyof SocialLink,
    value: string | boolean,
  ) => {
    setSocialLinks((current) =>
      current.map((link, i) =>
        i === index
          ? { ...link, [field]: value }
          : link,
      ),
    );

    setSuccess("");
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks((current) =>
      current
        .filter((_, i) => i !== index)
        .map((link, i) => ({
          ...link,
          sortOrder: i,
        })),
    );

    setSuccess("");
  };

  const moveSocialLink = (
    index: number,
    direction: "up" | "down",
  ) => {
    setSocialLinks((current) => {
      const updated = [...current];

      const targetIndex =
        direction === "up" ? index - 1 : index + 1;

      if (
        targetIndex < 0 ||
        targetIndex >= updated.length
      ) {
        return current;
      }

      [updated[index], updated[targetIndex]] = [
        updated[targetIndex],
        updated[index],
      ];

      return updated.map((link, i) => ({
        ...link,
        sortOrder: i,
      }));
    });

    setSuccess("");
  };

  const saveContact = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (
        profile.email.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          profile.email.trim(),
        )
      ) {
        throw new Error("Please enter a valid contact email.");
      }

      for (const link of socialLinks) {
        if (!link.url.trim()) {
          throw new Error(
            `Please enter the URL for ${link.platform}.`,
          );
        }

        try {
          const parsedUrl = new URL(normalizeUrl(link.url));

          if (
            parsedUrl.protocol !== "https:" &&
            parsedUrl.protocol !== "http:"
          ) {
            throw new Error();
          }
        } catch {
          throw new Error(
            `Please enter a valid URL for ${link.platform}.`,
          );
        }
      }

      const payload = {
        ...profile,
        email: profile.email.trim(),
        socialLinks: socialLinks.map((link, index) => ({
          ...(link.id ? { id: link.id } : {}),
          platform: link.platform,
          label: link.label.trim(),
          url: normalizeUrl(link.url),
          isVisible: link.isVisible,
          sortOrder: index,
        })),
      };

      const response = await fetch("/api/contact", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: ContactResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to save contact information.",
        );
      }

      if (data.profile) {
        setProfile({
          ...EMPTY_PROFILE,
          ...data.profile,
        });
      }

      if (Array.isArray(data.socialLinks)) {
        setSocialLinks(data.socialLinks);
      }

      setSuccess("Contact information saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#101713]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <p className="text-sm text-[#A7B3AA]">
            Loading contact information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101713] px-4 py-8 text-[#F5F5F0] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Page heading */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              <MessageCircle className="h-4 w-4" />
              Portfolio management
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F0] sm:text-3xl">
              Contact Information
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#A7B3AA]">
              Manage the contact information and social media
              links displayed on your public portfolio.
            </p>
          </div>

          <button
            type="button"
            onClick={loadContact}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#17221B] px-4 py-2.5 text-sm font-medium text-[#DCE8DF] transition hover:border-emerald-400/30 hover:text-emerald-300 disabled:opacity-50"
          >
            Refresh information
          </button>
        </div>

        {/* Status messages */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.07] p-4 text-sm text-red-300">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] p-4 text-sm text-emerald-300">
            <Check className="h-5 w-5 shrink-0" />
            {success}
          </div>
        )}

        <form onSubmit={saveContact} className="space-y-7">

          {/* Contact details */}
          <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#17221B]">
            <div className="border-b border-white/[0.07] px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-400">
                  <Phone className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-semibold text-[#F5F5F0]">
                    Contact details
                  </h2>
                  <p className="mt-1 text-xs text-[#A7B3AA]">
                    These details will appear on the public contact section.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Introduction
                </label>
                <textarea
                  rows={3}
                  value={profile.intro}
                  onChange={(e) =>
                    updateProfile("intro", e.target.value)
                  }
                  placeholder="Write a short welcome message..."
                  className={inputClass + " resize-y"}
                />
                <p className="mt-2 text-xs text-[#718078]">
                  A short message displayed above your contact details.
                </p>
              </div>

              <div>
                <label className={labelClass}>
                  Phone number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) =>
                      updateProfile("phone", e.target.value)
                    }
                    placeholder="+251 9..."
                    className={inputClass + " pl-10"}
                  />
                </div>
                <p className="mt-2 text-xs text-[#718078]">
                  Visitors can click this number to call you.
                </p>
              </div>

              <div>
                <label className={labelClass}>
                  Contact email
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      updateProfile("email", e.target.value)
                    }
                    placeholder="yourname@example.com"
                    className={inputClass + " pl-10"}
                  />
                </div>
                <p className="mt-2 text-xs text-[#718078]">
                  Used for public email links and Resend notifications.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Address / Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(e) =>
                      updateProfile("address", e.target.value)
                    }
                    placeholder="Addis Ababa, Ethiopia"
                    className={inputClass + " pl-10"}
                  />
                </div>
                <p className="mt-2 text-xs text-[#718078]">
                  This address will be displayed publicly.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Working hours
                </label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
                  <input
                    type="text"
                    value={profile.workingHours}
                    onChange={(e) =>
                      updateProfile("workingHours", e.target.value)
                    }
                    placeholder="Monday - Friday: 8:00 AM to 5:00 PM"
                    className={inputClass + " pl-10"}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Social links */}
          <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#17221B]">
            <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] px-5 py-5 sm:flex-row sm:items-center sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-400">
                  <Globe className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-semibold text-[#F5F5F0]">
                    Social media links
                  </h2>
                  <p className="mt-1 text-xs text-[#A7B3AA]">
                    Add your social profiles. Only visible links appear publicly.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-lg border border-white/[0.08] bg-[#101713] px-3 py-2 text-xs text-[#A7B3AA]">
                  {visibleCount} visible
                </span>

                <button
                  type="button"
                  onClick={addSocialLink}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-xs font-bold text-[#062C20] transition hover:bg-emerald-300"
                >
                  <Plus className="h-4 w-4" />
                  Add social link
                </button>
              </div>
            </div>

            <div className="space-y-4 p-5 sm:p-7">
              {socialLinks.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 bg-[#101713]/60 px-5 py-10 text-center">
                  <Globe className="mx-auto h-9 w-9 text-[#718078]" />
                  <h3 className="mt-3 text-sm font-semibold text-[#DCE8DF]">
                    No social links yet
                  </h3>
                  <p className="mt-2 text-xs text-[#718078]">
                    Add GitHub, LinkedIn, Telegram, Instagram, or other profiles.
                  </p>
                  <button
                    type="button"
                    onClick={addSocialLink}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.08] px-4 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-400/15"
                  >
                    <Plus className="h-4 w-4" />
                    Add your first link
                  </button>
                </div>
              )}

              {socialLinks.map((link, index) => {
                const PlatformIcon = getPlatformIcon(link.platform);

                return (
                  <div
                    key={link.id || `social-${index}`}
                    className="rounded-xl border border-white/[0.08] bg-[#101713]/70 p-4 transition hover:border-emerald-400/20 sm:p-5"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-400">
                          <PlatformIcon className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-[#F5F5F0]">
                            {link.label ||
                              SOCIAL_PLATFORMS.find(
                                (item) => item.value === link.platform,
                              )?.label ||
                              "Social link"}
                          </p>
                          <p className="text-[11px] text-[#718078]">
                            Social profile {index + 1}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveSocialLink(index, "up")}
                          disabled={index === 0}
                          aria-label="Move social link up"
                          className="rounded-lg p-2 text-[#A7B3AA] transition hover:bg-white/[0.06] hover:text-emerald-300 disabled:opacity-25"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => moveSocialLink(index, "down")}
                          disabled={index === socialLinks.length - 1}
                          aria-label="Move social link down"
                          className="rounded-lg p-2 text-[#A7B3AA] transition hover:bg-white/[0.06] hover:text-emerald-300 disabled:opacity-25"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => removeSocialLink(index)}
                          aria-label="Delete social link"
                          className="rounded-lg p-2 text-red-400/70 transition hover:bg-red-400/10 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>
                          Platform
                        </label>
                        <select
                          value={link.platform}
                          onChange={(e) =>
                            updateSocialLink(
                              index,
                              "platform",
                              e.target.value,
                            )
                          }
                          className={inputClass}
                        >
                          {SOCIAL_PLATFORMS.map((platform) => (
                            <option
                              key={platform.value}
                              value={platform.value}
                              className="bg-[#17221B]"
                            >
                              {platform.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>
                          Display label
                        </label>
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) =>
                            updateSocialLink(
                              index,
                              "label",
                              e.target.value,
                            )
                          }
                          placeholder="My GitHub profile"
                          className={inputClass}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className={labelClass}>
                          Profile URL
                        </label>
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) =>
                            updateSocialLink(
                              index,
                              "url",
                              e.target.value,
                            )
                          }
                          placeholder="https://github.com/yourusername"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-4">
                      <div className="flex items-center gap-2">
                        {link.isVisible ? (
                          <Eye className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-[#718078]" />
                        )}

                        <span className="text-xs text-[#A7B3AA]">
                          {link.isVisible
                            ? "Visible on public portfolio"
                            : "Hidden from public portfolio"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          updateSocialLink(
                            index,
                            "isVisible",
                            !link.isVisible,
                          )
                        }
                        className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                          link.isVisible
                            ? "border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300 hover:bg-emerald-400/15"
                            : "border border-white/10 bg-white/[0.04] text-[#A7B3AA] hover:bg-white/[0.08]"
                        }`}
                      >
                        {link.isVisible ? "Hide link" : "Show link"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Public information preview */}
          <section className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.035] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
                <Eye className="h-4 w-4" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#F5F5F0]">
                  Public contact information
                </h3>
                <p className="mt-1 text-xs text-[#A7B3AA]">
                  This is a quick summary of the information managed here.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                {
                  label: "Phone",
                  value: profile.phone,
                  icon: Phone,
                },
                {
                  label: "Email",
                  value: profile.email,
                  icon: FaEnvelope,
                },
                {
                  label: "Address",
                  value: profile.address,
                  icon: MapPin,
                },
                {
                  label: "Working hours",
                  value: profile.workingHours,
                  icon: Clock,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex min-w-0 items-start gap-3 rounded-xl border border-white/[0.06] bg-[#101713]/60 p-3"
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#718078]">
                        {item.label}
                      </p>
                      <p className="mt-1 break-words text-xs text-[#DCE8DF]">
                        {item.value || "Not provided"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {socialLinks
                .filter((link) => link.isVisible)
                .map((link, index) => {
                  const Icon = getPlatformIcon(link.platform);

                  return (
                    <div
                      key={link.id || `${link.platform}-${index}`}
                      title={link.label || link.platform}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  );
                })}
            </div>
          </section>

          {/* Save button */}
          <div className="sticky bottom-4 z-20 flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-white/10 bg-[#17221B]/95 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:flex-row sm:items-center sm:px-6">
            <p className="text-xs text-[#A7B3AA]">
              Save your changes to update your contact information.
            </p>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-bold text-[#062C20] shadow-lg shadow-emerald-950/20 transition hover:-translate-y-0.5 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Contact Information
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
