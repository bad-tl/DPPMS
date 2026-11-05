
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

import { prisma } from "@/lib/prisma";



const messageSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(3).max(150),
  message: z.string().trim().min(10).max(5000),
  // Hidden honeypot field. Real visitors should leave this empty.
  extraCheck: z.string().optional(),
});

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

async function getPublicContact() {
  return prisma.contactProfile.findFirst({
    where: {
      user: {
        is: {
          role: "admin",
        },
      },
    },
    include: {
      socialLinks: {
        where: {
          isVisible: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });
}

// GET: Public contact information and visible social links.
export async function GET() {
  try {
    const contact = await getPublicContact();

    if (!contact) {
      return NextResponse.json({
        profile: null,
        socialLinks: [],
      });
    }

    return NextResponse.json({
      profile: {
        intro: contact.intro ?? "",
        phone: contact.phone ?? "",
        email: contact.email ?? "",
        address: contact.address ?? "",
        workingHours: contact.workingHours ?? "",
      },
      socialLinks: contact.socialLinks.map((link) => ({
        id: link.id,
        platform: link.platform,
        label: link.label ?? link.platform,
        url: link.url,
      })),
    });
  } catch (error) {
    console.error("GET /api/contact/public error:", error);

    return NextResponse.json(
      { error: "Unable to load contact information." },
      { status: 500 },
    );
  }
}

// POST: Save a visitor's message and send an email notification.
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const validation = messageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Please check your details and try again.",
          details: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = validation.data;

    // Ignore submissions caught by the honeypot.
    if (data.extraCheck) {
      return NextResponse.json({
        success: true,
        message: "Your message has been received.",
      });
    }

    const contact = await getPublicContact();

    if (!contact?.email) {
      return NextResponse.json(
        { error: "The contact email is not configured yet." },
        { status: 503 },
      );
    }

    const savedMessage = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        userId: contact.userId,
      },
    });

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    if (!apiKey || !fromEmail) {
      console.error("Resend is not configured: check RESEND_API_KEY and RESEND_FROM_EMAIL.");

      return NextResponse.json(
        {
          success: false,
          saved: true,
          error: "Your message was saved, but email notification is not configured. Please try another contact method.",
        },
        { status: 503 },
      );
    }

    const resend = new Resend(apiKey);

    const { data: resendData, error: resendError } = await resend.emails.send({
      from: fromEmail,
      to: contact.email,
      replyTo: data.email,
      subject: `Portfolio message: ${data.subject}`,
      text: [
        `New message from your portfolio`,
        ``,
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        `Subject: ${data.subject}`,
        ``,
        `Message:`,
        data.message,
        ``,
        `You can reply directly to this email to contact ${data.name}.`,
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#17221B;line-height:1.6">
          <h2 style="color:#047857">New portfolio message</h2>
          <p>You have received a new message through your portfolio contact form.</p>
          <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
          <p><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>
          <div style="background:#f3f7f4;padding:18px;border-radius:10px;margin-top:18px">
            <strong>Message</strong>
            <p style="white-space:pre-wrap">${escapeHtml(data.message)}</p>
          </div>
          <p style="font-size:13px;color:#64748b">
            Reply directly to this email to respond to ${escapeHtml(data.name)}.
          </p>
        </div>
      `,
    });

if (resendError || !resendData?.id) {
  console.error("Resend sending failed:", resendError);

  return NextResponse.json(
    {
      success: false,
      saved: true,
      error:
        "Your message was saved, but the email could not be sent.",
    },
    { status: 502 },
  );
}

console.log("Resend accepted email:", resendData.id);

    await prisma.contactMessage.update({
      where: {
        id: savedMessage.id,
      },
      data: {
        emailSentAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully. Thank you for reaching out!",
    });
  } catch (error) {
    console.error("POST /api/contact/public error:", error);

    return NextResponse.json(
      { error: "Something went wrong while sending your message." },
      { status: 500 },
    );
  }
}
