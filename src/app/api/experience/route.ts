
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// --------------------------------------------------
// Authentication
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
// Validation schemas
// --------------------------------------------------

const employmentTypes = [
  "FULL_TIME",
  "PART_TIME",
  "INTERNSHIP",
  "CONTRACT",
  "FREELANCE",
  "SELF_EMPLOYED",
  "VOLUNTEER",
  "OTHER",
] as const;

const highlightSchema = z.object({
  content: z.string().trim().min(1, "Highlight is required").max(1000),
  sortOrder: z.number().int().min(0).default(0),
});

const experienceSchema = z.object({
  company: z.string().trim().min(1).max(150),
  position: z.string().trim().min(1).max(150),
  employmentType: z.enum(employmentTypes),
  location: z.string().trim().max(150).nullable().optional(),
  description: z.string().trim().max(5000).nullable().optional(),

  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
  isCurrentlyWorking: z.boolean().default(false),

  companyLogo: z.string().url().nullable().optional(),
  companyLogoPublicId: z.string().max(500).nullable().optional(),

  isVisible: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),

  highlights: z.array(highlightSchema).default([]),
});

const updateExperienceSchema = experienceSchema.partial().extend({
  id: z.string().min(1, "Experience ID is required"),
});

// --------------------------------------------------
// Error response
// --------------------------------------------------

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// --------------------------------------------------
// GET: Retrieve admin experiences
// --------------------------------------------------

export async function GET() {
  try {
    const user = await requireAdmin();

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const experiences = await prisma.experience.findMany({
      where: {
        userId: user.id,
      },
      include: {
        highlights: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
      orderBy: [
        { sortOrder: "asc" },
        { startDate: "desc" },
      ],
    });

    return NextResponse.json(experiences);
  } catch (error) {
    console.error("GET experiences error:", error);
    return errorResponse("Failed to retrieve experiences", 500);
  }
}

// --------------------------------------------------
// POST: Create experience
// --------------------------------------------------

export async function POST(request: Request) {
  try {
    const user = await requireAdmin();

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const validation = experienceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid experience data",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      highlights,
      ...experienceData
    } = validation.data;

    if (
      experienceData.isCurrentlyWorking &&
      experienceData.endDate
    ) {
      return errorResponse(
        "An ongoing experience cannot have an end date",
        400
      );
    }

    if (
      experienceData.endDate &&
      experienceData.endDate < experienceData.startDate
    ) {
      return errorResponse(
        "End date cannot be earlier than start date",
        400
      );
    }

    const experience = await prisma.experience.create({
      data: {
        ...experienceData,
        location: experienceData.location ?? null,
        description: experienceData.description ?? null,
        endDate: experienceData.isCurrentlyWorking
          ? null
          : experienceData.endDate ?? null,
        companyLogo: experienceData.companyLogo ?? null,
        companyLogoPublicId:
          experienceData.companyLogoPublicId ?? null,
        userId: user.id,

        highlights: {
          create: highlights,
        },
      },
      include: {
        highlights: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    return NextResponse.json(experience, { status: 201 });
  } catch (error) {
    console.error("POST experience error:", error);
    return errorResponse("Failed to create experience", 500);
  }
}

// --------------------------------------------------
// PUT: Update experience
// --------------------------------------------------

export async function PUT(request: Request) {
  try {
    const user = await requireAdmin();

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const validation = updateExperienceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid experience data",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { id, highlights, ...updates } = validation.data;

    const existing = await prisma.experience.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        highlights: true,
      },
    });

    if (!existing) {
      return errorResponse("Experience not found", 404);
    }

    const nextStartDate = updates.startDate ?? existing.startDate;
    const nextCurrentlyWorking =
      updates.isCurrentlyWorking ?? existing.isCurrentlyWorking;

    const nextEndDate = nextCurrentlyWorking
      ? null
      : updates.endDate !== undefined
        ? updates.endDate
        : existing.endDate;

    if (nextEndDate && nextEndDate < nextStartDate) {
      return errorResponse(
        "End date cannot be earlier than start date",
        400
      );
    }

    const experience = await prisma.experience.update({
      where: {
        id,
      },
      data: {
        ...updates,
        endDate: nextEndDate,
        highlights:
          highlights !== undefined
            ? {
                deleteMany: {},
                create: highlights,
              }
            : undefined,
      },
      include: {
        highlights: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    return NextResponse.json(experience);
  } catch (error) {
    console.error("PUT experience error:", error);
    return errorResponse("Failed to update experience", 500);
  }
}

// --------------------------------------------------
// DELETE: Delete experience
// --------------------------------------------------

export async function DELETE(request: Request) {
  try {
    const user = await requireAdmin();

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Experience ID is required", 400);
    }

    const result = await prisma.experience.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    });

    if (result.count === 0) {
      return errorResponse("Experience not found", 404);
    }

    return NextResponse.json({
      message: "Experience deleted successfully",
    });
  } catch (error) {
    console.error("DELETE experience error:", error);
    return errorResponse("Failed to delete experience", 500);
  }
}
