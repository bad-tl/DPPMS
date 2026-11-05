import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { Readable } from "node:stream";

import { auth } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";

export const instant = false;

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedSections = [
  "hero",
  "about",
  "education",
   "skills",
   "experience",
  "projects",
  "certificates",
  "gallery",
] as const;

type UploadSection = (typeof allowedSections)[number];

function uploadImage(
  buffer: Buffer,
  folder: string,
): Promise<{
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary returned no upload result."));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      },
    );

    Readable.from(buffer).pipe(stream);
  });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  if (session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 403 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const section = formData.get("section");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please select an image file." },
        { status: 400 },
      );
    }

    if (
      typeof section !== "string" ||
      !allowedSections.includes(section as UploadSection)
    ) {
      return NextResponse.json(
        { error: "Invalid upload section." },
        { status: 400 },
      );
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Images must be smaller than 5 MB." },
        { status: 400 },
      );
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Use a JPG, PNG, WebP, or AVIF image." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadImage(
      buffer,
      `dppms/${section}`,
    );

    return NextResponse.json({
      message: "Image uploaded successfully.",
      image: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      },
    });
  } catch (error) {
    console.error("Cloudinary upload failed:", error);

    return NextResponse.json(
      { error: "Image upload failed. Please try again." },
      { status: 500 },
    );
  }
}