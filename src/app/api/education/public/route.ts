
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const education = await prisma.education.findMany({
      where: {
        isVisible: true,
      },
      orderBy: [
        { sortOrder: "asc" },
        { startDate: "desc" },
      ],
      select: {
        id: true,
        institution: true,
        degree: true,
        fieldOfStudy: true,
        description: true,
        startDate: true,
        endDate: true,
        isCurrentlyStudying: true,
        grade: true,
        institutionLogo: true,
      },
    });

    return NextResponse.json(education);
  } catch (error) {
    console.error("Public education API error:", error);

    return NextResponse.json(
      { message: "Unable to load education records." },
      { status: 500 },
    );
  }
}
