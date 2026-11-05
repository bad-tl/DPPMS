
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      where: {
        isVisible: true,
      },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "asc" },
      ],
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        proficiency: true,
        sortOrder: true,
        icon: true,
      },
    });

    return NextResponse.json(
      { skills },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Public skills API error:", error);

    return NextResponse.json(
      { error: "Unable to load skills." },
      { status: 500 },
    );
  }
}
