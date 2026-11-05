
"use client";

import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle, Trash2, Upload } from "lucide-react";

export type UploadSection =
  | "hero"
  | "about"
  | "education"
  | "skills"
  | "experience"
  | "projects"
  | "certificates"
  | "gallery";

type ImageUploadProps = {
  section: UploadSection;
  value: string | null;
  publicId: string | null;
  onChange: (image: {
    url: string | null;
    publicId: string | null;
  }) => void;
  label?: string;
};

export function ImageUpload({
  section,
  value,
  publicId,
  onChange,
  label = "Upload image",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    if (file.size > 5 * 1024 * 1024) {
      setError("Choose an image smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("section", section);

    setUploading(true);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Image upload failed.");
      }

      onChange({
        url: result.image.url,
        publicId: result.image.publicId,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Image upload failed.",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function clearImage() {
    onChange({ url: null, publicId: null });
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      <span className="block text-sm font-medium text-[#D2DED5]">
        {label}
      </span>

      {value ? (
        <div className="flex flex-col gap-4 rounded-xl border border-[#29382F] bg-[#101713] p-4 sm:flex-row sm:items-center">
          <img
            src={value}
            alt="Uploaded image preview"
            className="size-28 rounded-xl border border-[#29382F] object-cover"
          />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#F5F7F5]">
              Image uploaded
            </p>
            <p className="mt-1 break-all text-xs text-[#A7B3AA]">
              {publicId}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-lg border border-[#29382F] px-3 py-2 text-sm text-[#D2DED5] hover:border-[#34D399] disabled:opacity-50"
              >
                <Upload className="size-4" />
                Replace
              </button>

              <button
                type="button"
                onClick={clearImage}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-lg border border-red-400/30 px-3 py-2 text-sm text-red-300 hover:bg-red-400/10 disabled:opacity-50"
              >
                <Trash2 className="size-4" />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex min-h-40 w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#425448] bg-[#101713] px-4 py-6 text-center transition hover:border-[#34D399] hover:bg-[#1D2B22] disabled:cursor-wait disabled:opacity-60"
        >
          {uploading ? (
            <LoaderCircle className="size-7 animate-spin text-[#34D399]" />
          ) : (
            <ImagePlus className="size-7 text-[#34D399]" />
          )}

          <span className="mt-3 text-sm font-medium text-[#F5F7F5]">
            {uploading ? "Uploading image..." : "Choose an image"}
          </span>
          <span className="mt-1 text-xs text-[#A7B3AA]">
            JPG, PNG, WebP, or AVIF · Maximum 5 MB
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />

      {error && (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
