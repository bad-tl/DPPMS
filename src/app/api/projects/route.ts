
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

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

// --------------------------------------------------
// VALIDATION SCHEMAS
// --------------------------------------------------

const projectImageSchema = z.object({
  imageUrl: z.string().min(1, "Image URL is required"),
  publicId: z.string().min(1, "Cloudinary public ID is required"),
  alt: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
});

const projectHighlightSchema = z.object({
  content: z.string().trim().min(1, "Highlight cannot be empty"),
  sortOrder: z.number().int().min(0).default(0),
});

const projectSchema = z
  .object({
    title: z.string().trim().min(2).max(150),

    slug: z
      .string()
      .trim()
      .min(2)
      .max(180)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain lowercase letters, numbers, and hyphens only",
      ),

    shortDescription: z.string().nullable().optional(),
    description: z.string().nullable().optional(),

    role: z.string().nullable().optional(),
    category: z.string().nullable().optional(),

    technologies: z.array(z.string().trim().min(1)).default([]),

    liveUrl: z.string().url().or(z.literal("")).nullable().optional(),
    sourceCodeUrl: z.string().url().or(z.literal("")).nullable().optional(),
    caseStudyUrl: z.string().url().or(z.literal("")).nullable().optional(),

    startDate: z.coerce.date().nullable().optional(),
    endDate: z.coerce.date().nullable().optional(),

    status: z
      .enum(["COMPLETED", "IN_PROGRESS", "PLANNED"])
      .default("COMPLETED"),

    coverImage: z.string().nullable().optional(),
    coverImagePublicId: z.string().nullable().optional(),

    isFeatured: z.boolean().default(false),
    isVisible: z.boolean().default(true),
    sortOrder: z.number().int().min(0).default(0),

    images: z.array(projectImageSchema).optional(),
    highlights: z.array(projectHighlightSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.startDate &&
      data.endDate &&
      data.endDate < data.startDate
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date cannot be before start date",
      });
    }
  });

const updateProjectSchema = projectSchema.extend({
  id: z.string().min(1, "Project ID is required"),
});

// --------------------------------------------------
// GET: FETCH ADMIN PROJECTS
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

    const projects = await prisma.project.findMany({
      where: {
        userId: user.id,
      },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        highlights: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Get projects error:", error);

    return errorResponse("Unable to fetch projects.", 500);
  }
}

// --------------------------------------------------
// POST: CREATE PROJECT
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

    const validation = projectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid project data",
          details: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const {
      images,
      highlights,
      ...projectData
    } = validation.data;

    const project = await prisma.project.create({
      data: {
        ...projectData,
        userId: user.id,

        ...(images !== undefined && {
          images: {
            create: images,
          },
        }),

        ...(highlights !== undefined && {
          highlights: {
            create: highlights,
          },
        }),
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        highlights: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);

    if (isUniqueConstraintError(error)) {
      return errorResponse(
        "A project with this slug already exists.",
        409,
      );
    }

    return errorResponse("Unable to create project.", 500);
  }
}

// --------------------------------------------------
// PUT: UPDATE PROJECT
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

    const validation = updateProjectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid project data",
          details: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const {
      id,
      images,
      highlights,
      ...projectData
    } = validation.data;

    // Verify project ownership
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingProject) {
      return errorResponse("Project not found.", 404);
    }

    const project = await prisma.project.update({
      where: {
        id,
      },
      data: {
        ...projectData,

        ...(images !== undefined && {
          images: {
            deleteMany: {},
            create: images,
          },
        }),

        ...(highlights !== undefined && {
          highlights: {
            deleteMany: {},
            create: highlights,
          },
        }),
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        highlights: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Update project error:", error);

    if (isUniqueConstraintError(error)) {
      return errorResponse(
        "A project with this slug already exists.",
        409,
      );
    }

    return errorResponse("Unable to update project.", 500);
  }
}

// --------------------------------------------------
// DELETE: DELETE PROJECT
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
      return errorResponse("Project ID is required.", 400);
    }

    const result = await prisma.project.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    });

    if (result.count === 0) {
      return errorResponse("Project not found.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    return errorResponse("Unable to delete project.", 500);
  }
}
