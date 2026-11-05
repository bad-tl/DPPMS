import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: {
        isVisible: true,
      },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        description: true,
        role: true,
        category: true,
        technologies: true,
        liveUrl: true,
        sourceCodeUrl: true,
        caseStudyUrl: true,
        startDate: true,
        endDate: true,
        status: true,
        coverImage: true,
        isFeatured: true,
        sortOrder: true,

        images: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            imageUrl: true,
            alt: true,
            sortOrder: true,
          },
        },

        highlights: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            content: true,
            sortOrder: true,
          },
        },
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Public projects API error:", error);

    return NextResponse.json(
      { error: "Unable to load projects." },
      { status: 500 },
    );
  }
}