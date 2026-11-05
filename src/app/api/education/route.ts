
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return session.user;
}

const educationSchema = z
  .object({
    institution: z.string().trim().min(1, "Institution is required").max(200),
    degree: z.string().trim().min(1, "Degree is required").max(150),
    fieldOfStudy: z
      .string()
      .trim()
      .min(1, "Field of study is required")
      .max(150),
    description: z.string().max(5000).nullable().optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().nullable().optional(),
    isCurrentlyStudying: z.boolean().default(false),
    grade: z.string().max(100).nullable().optional(),
    institutionLogo: z.string().url().nullable().optional(),
    institutionLogoPublicId: z.string().max(500).nullable().optional(),
    isVisible: z.boolean().default(true),
    sortOrder: z.number().int().min(0).default(0),
  })
  .refine(
    (data) =>
      data.isCurrentlyStudying ||
      !data.endDate ||
      data.endDate >= data.startDate,
    {
      message: "End date cannot be earlier than start date.",
      path: ["endDate"],
    },
  );

const updateEducationSchema = z.object({
  id: z.string().min(1, "Education ID is required"),
  institution: z.string().trim().min(1).max(200).optional(),
  degree: z.string().trim().min(1).max(200).optional(),
  fieldOfStudy: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().nullable().optional(),
  isCurrentlyStudying: z.boolean().optional(),
  grade: z.string().max(100).nullable().optional(),
  institutionLogo: z.string().url().nullable().optional(),
  institutionLogoPublicId: z.string().max(500).nullable().optional(),
  isVisible: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
}).refine(
  (data) => {
    if (
      data.isCurrentlyStudying === true ||
      data.endDate === null ||
      data.endDate === undefined ||
      data.startDate === undefined
    ) {
      return true;
    }

    return data.endDate >= data.startDate;
  },
  {
    message: "End date cannot be earlier than start date.",
    path: ["endDate"],
  },
);

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// GET: Retrieve the signed-in admin's education records.
export async function GET() {
  try {
    const user = await requireAdmin();

    if (!user) {
      return errorResponse("Unauthorized. Please sign in as an admin.", 401);
    }

    const education = await prisma.education.findMany({
      where: { userId: user.id },
      orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }],
    });

    return NextResponse.json({ education });
  } catch (error) {
    console.error("Failed to retrieve education records:", error);
    return errorResponse("Unable to retrieve education records.", 500);
  }
}

// POST: Create an education record.
export async function POST(request: Request) {
  try {
    const user = await requireAdmin();

    if (!user) {
      return errorResponse("Unauthorized. Please sign in as an admin.", 401);
    }

    const body: unknown = await request.json();
    const parsed = educationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Please check the education information.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const education = await prisma.education.create({
      data: {
        ...data,
        description: data.description ?? null,
        endDate: data.isCurrentlyStudying ? null : data.endDate ?? null,
        grade: data.grade ?? null,
        institutionLogo: data.institutionLogo ?? null,
        institutionLogoPublicId: data.institutionLogoPublicId ?? null,
        userId: user.id,
      },
    });

    return NextResponse.json({ education }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse("Invalid JSON request body.", 400);
    }

    console.error("Failed to create education record:", error);
    return errorResponse("Unable to create education record.", 500);
  }
}

// PUT: Update an existing education record owned by the signed-in admin.
export async function PUT(request: Request) {
  try {
    const user = await requireAdmin();

    if (!user) {
      return errorResponse("Unauthorized. Please sign in as an admin.", 401);
    }

    const body: unknown = await request.json();
    const parsed = updateEducationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Please check the education information.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { id, ...updates } = parsed.data;

    const existing = await prisma.education.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });

    if (!existing) {
      return errorResponse("Education record not found.", 404);
    }

    const data = {
      ...updates,
      ...(updates.isCurrentlyStudying === true
        ? { endDate: null }
        : {}),
    };

    if (
      data.startDate &&
      data.endDate &&
      data.endDate < data.startDate
    ) {
      return errorResponse(
        "End date cannot be earlier than start date.",
        400,
      );
    }

    const education = await prisma.education.update({
      where: { id },
      data,
    });

    return NextResponse.json({ education });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse("Invalid JSON request body.", 400);
    }

    console.error("Failed to update education record:", error);
    return errorResponse("Unable to update education record.", 500);
  }
}

// DELETE: Delete an education record owned by the signed-in admin.
export async function DELETE(request: Request) {
  try {
    const user = await requireAdmin();

    if (!user) {
      return errorResponse("Unauthorized. Please sign in as an admin.", 401);
    }

    const body: unknown = await request.json().catch(() => null);
    const parsed = z.object({ id: z.string().min(1) }).safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        "A valid education record ID is required in the request body.",
        400,
      );
    }

    const result = await prisma.education.deleteMany({
      where: {
        id: parsed.data.id,
        userId: user.id,
      },
    });

    if (result.count === 0) {
      return errorResponse("Education record not found.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Education record deleted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete education record:", error);
    return errorResponse("Unable to delete education record.", 500);
  }
}
