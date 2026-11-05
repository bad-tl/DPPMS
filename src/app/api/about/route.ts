
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";



const aboutSchema = z.object({
  sectionTitle: z.string().trim().min(1).max(100),
  subtitle: z.string().trim().max(200),
  biography: z.string().trim().min(1).max(5000),

  imageUrl: z.string().url().nullable(),
  imagePublicId: z.string().max(255).nullable(),

  professionalRole: z.string().trim().max(150).nullable(),
  professionalStatus: z.string().trim().max(100).nullable(),
  yearsOfExperience: z.number().int().min(0).max(100),
  projectsCompleted: z.number().int().min(0).max(1000000),
  happyClients: z.number().int().min(0).max(1000000),

  isVisible: z.boolean(),

  highlights: z.array(
    z.object({
      label: z.string().trim().min(1).max(100),
      value: z.string().trim().min(1).max(250),
      sortOrder: z.number().int().min(0),
    }),
  ).max(50),

  strengths: z.array(
    z.object({
      title: z.string().trim().min(1).max(100),
      description: z.string().trim().max(1000).nullable(),
      category: z.enum(["STRENGTH", "VALUE", "INTEREST"]),
      sortOrder: z.number().int().min(0),
    }),
  ).max(100),
});

async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      ),
    };
  }

  if (session.user.role !== "admin") {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 },
      ),
    };
  }

  return {
    authorized: true as const,
    userId: session.user.id,
  };
}

// GET /api/about — load the current administrator's About content.
export async function GET() {
  const authorization = await requireAdmin();

  if (!authorization.authorized) {
    return authorization.response;
  }

  try {
    const about = await prisma.about.findUnique({
      where: { userId: authorization.userId },
      include: {
        highlights: { orderBy: { sortOrder: "asc" } },
        strengths: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json({ about });
  } catch (error) {
    console.error("Failed to retrieve About content:", error);

    return NextResponse.json(
      { error: "Unable to retrieve About content." },
      { status: 500 },
    );
  }
}

// PUT /api/about — create or update the current administrator's About content.
export async function PUT(request: Request) {
  const authorization = await requireAdmin();

  if (!authorization.authorized) {
    return authorization.response;
  }

  try {
    const body: unknown = await request.json();
    const result = aboutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Please check the About form fields.",
          details: result.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = result.data;

    const about = await prisma.about.upsert({
      where: { userId: authorization.userId },

      create: {
        userId: authorization.userId,
        sectionTitle: data.sectionTitle,
        subtitle: data.subtitle,
        biography: data.biography,
        imageUrl: data.imageUrl,
        imagePublicId: data.imagePublicId,
        professionalRole: data.professionalRole,
        professionalStatus: data.professionalStatus,
        yearsOfExperience: data.yearsOfExperience,
        projectsCompleted: data.projectsCompleted,
        happyClients: data.happyClients,
        isVisible: data.isVisible,
        highlights: {
          create: data.highlights,
        },
        strengths: {
          create: data.strengths,
        },
      },

      update: {
        sectionTitle: data.sectionTitle,
        subtitle: data.subtitle,
        biography: data.biography,
        imageUrl: data.imageUrl,
        imagePublicId: data.imagePublicId,
        professionalRole: data.professionalRole,
        professionalStatus: data.professionalStatus,
        yearsOfExperience: data.yearsOfExperience,
        projectsCompleted: data.projectsCompleted,
        happyClients: data.happyClients,
        isVisible: data.isVisible,
        highlights: {
          deleteMany: {},
          create: data.highlights,
        },
        strengths: {
          deleteMany: {},
          create: data.strengths,
        },
      },

      include: {
        highlights: { orderBy: { sortOrder: "asc" } },
        strengths: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json({
      message: "About content saved successfully.",
      about,
    });
  } catch (error) {
    console.error("Failed to save About content:", error);

    return NextResponse.json(
      { error: "Unable to save About content." },
      { status: 500 },
    );
  }
}
