import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const instant = false;

const heroSchema = z.object({
  fullName: z.string().trim().min(1).max(100),
  professionalTitle: z.string().trim().min(1).max(150),
  headline: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(2000),

  profileImage: z.string().url().nullable().optional(),
  profileImagePublicId: z.string().max(255).nullable().optional(),

  primaryButtonText: z.string().trim().min(1).max(50),
  primaryButtonLink: z.string().trim().min(1).max(500),

  secondaryButtonText: z.string().trim().min(1).max(50),
  secondaryButtonLink: z.string().trim().min(1).max(500),
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

  return { authorized: true as const };
}

// GET /api/hero
// Public endpoint: retrieve the portfolio's Hero content.
export async function GET() {
  try {
    const hero = await prisma.hero.findFirst({
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ hero });
  } catch (error) {
    console.error("Failed to retrieve Hero content:", error);

    return NextResponse.json(
      { error: "Unable to retrieve Hero content." },
      { status: 500 },
    );
  }
}

// PUT /api/hero
// Admin-only endpoint: create or update the Hero content.
export async function PUT(request: Request) {
  const authorization = await requireAdmin();

  if (!authorization.authorized) {
    return authorization.response;
  }

  try {
    const body: unknown = await request.json();
    const result = heroSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Please check the Hero form fields.",
          details: result.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = result.data;

    const existingHero = await prisma.hero.findFirst({
      orderBy: { createdAt: "asc" },
    });

    const hero = existingHero
      ? await prisma.hero.update({
          where: { id: existingHero.id },
          data: {
            ...data,
            profileImage: data.profileImage ?? null,
            profileImagePublicId: data.profileImagePublicId ?? null,
          },
        })
      : await prisma.hero.create({
          data: {
            ...data,
            profileImage: data.profileImage ?? null,
            profileImagePublicId: data.profileImagePublicId ?? null,
          },
        });

    return NextResponse.json({
      message: "Hero content saved successfully.",
      hero,
    });
  } catch (error) {
    console.error("Failed to save Hero content:", error);

    return NextResponse.json(
      { error: "Unable to save Hero content." },
      { status: 500 },
    );
  }
}