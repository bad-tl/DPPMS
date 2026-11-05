
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const about = await prisma.about.findFirst({
      where: {
        isVisible: true,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        sectionTitle: true,
        subtitle: true,
        biography: true,
        imageUrl: true,
        professionalRole: true,
        professionalStatus: true,
        yearsOfExperience: true,
        projectsCompleted: true,
        happyClients: true,
        highlights: {
          orderBy: { sortOrder: "asc" },
          select: {
            label: true,
            value: true,
            sortOrder: true,
          },
        },
        strengths: {
          orderBy: { sortOrder: "asc" },
          select: {
            title: true,
            description: true,
            category: true,
            sortOrder: true,
          },
        },
      },
    });

    return NextResponse.json(
      { about },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Failed to retrieve public About content:", error);

    return NextResponse.json(
      { error: "Unable to retrieve About content." },
      { status: 500 },
    );
  }
}
