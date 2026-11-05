
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const certificates = await prisma.certificate.findMany({
      where: {
        isVisible: true,
      },
      orderBy: [
        { isFeatured: "desc" },
        { sortOrder: "asc" },
        { issueDate: "desc" },
      ],
      select: {
        id: true,
        title: true,
        issuer: true,
        description: true,
        issueDate: true,
        expirationDate: true,
        credentialId: true,
        credentialUrl: true,
        imageUrl: true,
        documentUrl: true,
        skills: true,
        isVisible: true,
        isFeatured: true,
        sortOrder: true,
      },
    });

    return NextResponse.json(certificates);
  } catch (error) {
    console.error("Public certificates API error:", error);

    return NextResponse.json(
      { error: "Failed to fetch certificates." },
      { status: 500 },
    );
  }
}
