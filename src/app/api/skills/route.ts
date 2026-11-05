
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

const skillCategories = [
  "PROGRAMMING_LANGUAGES",
  "FRAMEWORKS",
  "DATABASES",
  "TOOLS_AND_PLATFORMS",
  "TECHNICAL",
  "PROBLEM_SOLVING",
  "SOFT_SKILLS",
  "OTHER",
] as const;

const skillSchema = z.object({
  name: z.string().trim().min(1, "Skill name is required").max(100),
  category: z.enum(skillCategories),
  description: z.string().trim().max(1000).nullable().optional(),
  proficiency: z.number().int().min(0).max(100).default(70),
  sortOrder: z.number().int().min(0).default(0),
  icon: z.string().url().nullable().optional(),
  iconPublicId: z.string().max(500).nullable().optional(),
  isVisible: z.boolean().default(true),
});

const updateSkillSchema = z.object({
  id: z.string().min(1, "Skill ID is required"),
  name: z.string().trim().min(1).max(100).optional(),
  category: z.enum(skillCategories).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  proficiency: z.number().int().min(0).max(100).optional(),
  sortOrder: z.number().int().min(0).optional(),
  icon: z.string().url().nullable().optional(),
  iconPublicId: z.string().max(500).nullable().optional(),
  isVisible: z.boolean().optional(),
});

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// GET: Retrieve skills owned by the signed-in admin.
export async function GET() {
  try {
    const user = await requireAdmin();

    if (!user) {
      return errorResponse("Unauthorized. Please sign in as an admin.", 401);
    }

    const skills = await prisma.skill.findMany({
      where: { userId: user.id },
      orderBy: [
        { category: "asc" },
        { sortOrder: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({ skills });
  } catch (error) {
    console.error("Failed to retrieve skills:", error);
    return errorResponse("Unable to retrieve skills.", 500);
  }
}

// POST: Create a skill.
export async function POST(request: Request) {
  try {
    const user = await requireAdmin();

    if (!user) {
      return errorResponse("Unauthorized. Please sign in as an admin.", 401);
    }

    const body: unknown = await request.json();
    const parsed = skillSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Please check the skill information.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const skill = await prisma.skill.create({
      data: {
        ...data,
        description: data.description ?? null,
        icon: data.icon ?? null,
        iconPublicId: data.iconPublicId ?? null,
        userId: user.id,
      },
    });

    return NextResponse.json({ skill }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse("Invalid JSON request body.", 400);
    }

    console.error("Failed to create skill:", error);
    return errorResponse("Unable to create skill.", 500);
  }
}

// PUT: Update a skill owned by the signed-in admin.
export async function PUT(request: Request) {
  try {
    const user = await requireAdmin();

    if (!user) {
      return errorResponse("Unauthorized. Please sign in as an admin.", 401);
    }

    const body: unknown = await request.json();
    const parsed = updateSkillSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Please check the skill information.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { id, ...updates } = parsed.data;

    const existing = await prisma.skill.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });

    if (!existing) {
      return errorResponse("Skill not found.", 404);
    }

    const skill = await prisma.skill.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ skill });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse("Invalid JSON request body.", 400);
    }

    console.error("Failed to update skill:", error);
    return errorResponse("Unable to update skill.", 500);
  }
}

// DELETE: Delete a skill owned by the signed-in admin.
export async function DELETE(request: Request) {
  try {
    const user = await requireAdmin();

    if (!user) {
      return errorResponse("Unauthorized. Please sign in as an admin.", 401);
    }

    const body: unknown = await request.json().catch(() => null);
    const parsed = z.object({ id: z.string().min(1) }).safeParse(body);

    if (!parsed.success) {
      return errorResponse("A valid skill ID is required.", 400);
    }

    const result = await prisma.skill.deleteMany({
      where: {
        id: parsed.data.id,
        userId: user.id,
      },
    });

    if (result.count === 0) {
      return errorResponse("Skill not found.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Skill deleted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete skill:", error);
    return errorResponse("Unable to delete skill.", 500);
  }
}
