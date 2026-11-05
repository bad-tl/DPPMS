
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// --------------------------------------------------
// ADMIN AUTHENTICATION
// --------------------------------------------------

async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return session.user;
}

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// --------------------------------------------------
// VALIDATION SCHEMA
// --------------------------------------------------

const certificateSchema = z
  .object({
    title: z.string().trim().min(2).max(180),

    issuer: z.string().trim().min(2).max(150),

    description: z.string().nullable().optional(),

    issueDate: z.coerce.date(),

    expirationDate: z.coerce.date().nullable().optional(),

    credentialId: z.string().trim().nullable().optional(),

    credentialUrl: z
      .string()
      .url("Enter a valid verification URL")
      .or(z.literal(""))
      .nullable()
      .optional(),

    imageUrl: z.string().nullable().optional(),

    documentUrl: z.string().nullable().optional(),

    skills: z.array(z.string().trim().min(1)).default([]),

    isVisible: z.boolean().default(true),

    isFeatured: z.boolean().default(false),

    sortOrder: z.number().int().min(0).default(0),
  })
  .superRefine((data, ctx) => {
    if (
      data.expirationDate &&
      data.expirationDate < data.issueDate
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["expirationDate"],
        message: "Expiration date cannot be before issue date.",
      });
    }
  });

const updateCertificateSchema = certificateSchema.extend({
  id: z.string().min(1, "Certificate ID is required"),
});

// --------------------------------------------------
// GET: FETCH ADMIN CERTIFICATES
// --------------------------------------------------

export async function GET() {
  try {
    const user = await requireAdmin();

    if (!user) {
      return errorResponse(
        "Unauthorized. Please sign in as an admin.",
        401,
      );
    }

    const certificates = await prisma.certificate.findMany({
      where: {
        userId: user.id,
      },
      orderBy: [
        { sortOrder: "asc" },
        { issueDate: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(certificates);
  } catch (error) {
    console.error("Get certificates error:", error);

    return errorResponse("Unable to fetch certificates.", 500);
  }
}

// --------------------------------------------------
// POST: CREATE CERTIFICATE
// --------------------------------------------------

export async function POST(request: Request) {
  try {
    const user = await requireAdmin();

    if (!user) {
      return errorResponse(
        "Unauthorized. Please sign in as an admin.",
        401,
      );
    }

    const body = await request.json();

    const validation = certificateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid certificate data",
          details: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const certificate = await prisma.certificate.create({
      data: {
        ...validation.data,
        userId: user.id,
      },
    });

    return NextResponse.json(certificate, { status: 201 });
  } catch (error) {
    console.error("Create certificate error:", error);

    return errorResponse("Unable to create certificate.", 500);
  }
}

// --------------------------------------------------
// PUT: UPDATE CERTIFICATE
// --------------------------------------------------

export async function PUT(request: Request) {
  try {
    const user = await requireAdmin();

    if (!user) {
      return errorResponse(
        "Unauthorized. Please sign in as an admin.",
        401,
      );
    }

    const body = await request.json();

    const validation = updateCertificateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid certificate data",
          details: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { id, ...certificateData } = validation.data;

    // Verify certificate ownership
    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingCertificate) {
      return errorResponse("Certificate not found.", 404);
    }

    const certificate = await prisma.certificate.update({
      where: {
        id,
      },
      data: certificateData,
    });

    return NextResponse.json(certificate);
  } catch (error) {
    console.error("Update certificate error:", error);

    return errorResponse("Unable to update certificate.", 500);
  }
}

// --------------------------------------------------
// DELETE: DELETE CERTIFICATE
// --------------------------------------------------

export async function DELETE(request: Request) {
  try {
    const user = await requireAdmin();

    if (!user) {
      return errorResponse(
        "Unauthorized. Please sign in as an admin.",
        401,
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Certificate ID is required.", 400);
    }

    const result = await prisma.certificate.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    });

    if (result.count === 0) {
      return errorResponse("Certificate not found.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Certificate deleted successfully.",
    });
  } catch (error) {
    console.error("Delete certificate error:", error);

    return errorResponse("Unable to delete certificate.", 500);
  }
}
