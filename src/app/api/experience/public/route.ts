
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const experiences = await prisma.experience.findMany({
      where: {
        isVisible: true,
      },
      orderBy: [
        { sortOrder: "asc" },
        { startDate: "desc" },
      ],
      select: {
        id: true,
        company: true,
        position: true,
        employmentType: true,
        location: true,
        description: true,
        startDate: true,
        endDate: true,
        isCurrentlyWorking: true,
        companyLogo: true,
        isVisible: true,
        sortOrder: true,

        highlights: {
          orderBy: {
            sortOrder: "asc",
          },
          select: {
            id: true,
            content: true,
            sortOrder: true,
          },
        },
      },
    });

    return NextResponse.json(experiences);
  } catch (error) {
    console.error("Public experience API error:", error);

    return NextResponse.json(
      { message: "Unable to load experience records." },
      { status: 500 },
    );
  }
}
