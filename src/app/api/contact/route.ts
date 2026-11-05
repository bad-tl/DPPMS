
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

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

const contactSchema = z.object({
  intro: z.string().trim().max(2000),
  phone: z.string().trim().max(50),
  email: z
    .string()
    .trim()
    .email()
    .or(z.literal("")),
  address: z.string().trim().max(500),
  workingHours: z.string().trim().max(200),

  socialLinks: z
    .array(
      z.object({
        platform: z.string().trim().min(1).max(50),
        label: z.string().trim().max(100),
        url: z.string().trim().url(),
        isVisible: z.boolean(),
        sortOrder: z.number().int(),
      }),
    )
    .max(30)
    .refine(
      (links) =>
        new Set(links.map((link) => link.platform)).size === links.length,
      { message: "Each social platform can only be added once." },
    ),
});

function formatContact(profile: {
  id: string;
  intro: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  workingHours: string | null;
  socialLinks: {
    id: string;
    platform: string;
    label: string | null;
    url: string;
    isVisible: boolean;
    sortOrder: number;
  }[];
}) {
  return {
    profile: {
      intro: profile.intro ?? "",
      phone: profile.phone ?? "",
      email: profile.email ?? "",
      address: profile.address ?? "",
      workingHours: profile.workingHours ?? "",
    },
    socialLinks: profile.socialLinks.map((link) => ({
      id: link.id,
      platform: link.platform,
      label: link.label ?? "",
      url: link.url,
      isVisible: link.isVisible,
      sortOrder: link.sortOrder,
    })),
  };
}

// GET: Load contact information for the admin page.
export async function GET() {
  try {
    const user = await requireAdmin();

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const contact = await prisma.contactProfile.findUnique({
      where: {
        userId: user.id,
      },
      include: {
        socialLinks: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    if (!contact) {
      return NextResponse.json({
        profile: {
          intro: "Feel free to contact me anytime. I'm always happy to discuss new opportunities.",
          phone: "",
          email: "",
          address: "",
          workingHours: "",
        },
        socialLinks: [],
      });
    }

    return NextResponse.json(formatContact(contact));
  } catch (error) {
    console.error("GET /api/contact error:", error);
    return errorResponse("Failed to load contact information.", 500);
  }
}

// PUT: Save contact information and social links.
export async function PUT(request: Request) {
  try {
    const user = await requireAdmin();

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const validation = contactSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid contact information.",
          details: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = validation.data;

    const contact = await prisma.contactProfile.upsert({
      where: {
        userId: user.id,
      },

      create: {
        userId: user.id,
        intro: data.intro || null,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        workingHours: data.workingHours || null,

        socialLinks: {
          create: data.socialLinks.map((link) => ({
            platform: link.platform,
            label: link.label || null,
            url: link.url,
            isVisible: link.isVisible,
            sortOrder: link.sortOrder,
          })),
        },
      },

      update: {
        intro: data.intro || null,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        workingHours: data.workingHours || null,

        socialLinks: {
          deleteMany: {},
          create: data.socialLinks.map((link) => ({
            platform: link.platform,
            label: link.label || null,
            url: link.url,
            isVisible: link.isVisible,
            sortOrder: link.sortOrder,
          })),
        },
      },

      include: {
        socialLinks: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    return NextResponse.json(formatContact(contact));
  } catch (error) {
    console.error("PUT /api/contact error:", error);
    return errorResponse("Failed to save contact information.", 500);
  }
}
