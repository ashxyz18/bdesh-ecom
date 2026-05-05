import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeId, formId, data } = body;

    if (
      !storeId ||
      typeof storeId !== "string" ||
      !formId ||
      typeof formId !== "string" ||
      !data ||
      typeof data !== "object" ||
      Array.isArray(data)
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Save submission to database
    const submission = await prisma.formSubmission.create({
      data: {
        storeId,
        formId,
        data: JSON.stringify(data),
        status: "NEW",
      },
    });

    // Also create a Lead if email or phone is present
    const normalizedEmailRaw =
      typeof data.email === "string"
        ? data.email
        : typeof data.Email === "string"
          ? data.Email
          : undefined;
    const normalizedPhone =
      typeof data.phone === "string"
        ? data.phone.trim()
        : typeof data.Phone === "string"
          ? data.Phone.trim()
          : undefined;
    const normalizedName =
      typeof data.name === "string"
        ? data.name.trim()
        : typeof data.Name === "string"
          ? data.Name.trim()
          : undefined;
    const normalizedEmail = normalizedEmailRaw?.trim().toLowerCase();

    if (normalizedEmail || normalizedPhone) {
      await prisma.lead.upsert({
        where: {
          storeId_email: {
            storeId,
            email: normalizedEmail || `no-email-${normalizedPhone || "unknown"}@bdesh.shop`,
          },
        },
        update: {
          phone: normalizedPhone || undefined,
          name: normalizedName || undefined,
          tags: JSON.stringify(["Form Submission"]),
        },
        create: {
          storeId,
          email: normalizedEmail || `no-email-${normalizedPhone || "unknown"}@bdesh.shop`,
          phone: normalizedPhone || undefined,
          name: normalizedName || undefined,
          source: "CONTACT_FORM",
          tags: JSON.stringify(["Form Submission"]),
        },
      });
    }

    return NextResponse.json({ success: true, id: submission.id });
  } catch (error: unknown) {
    console.error("Form submission error:", error);
    const message = error instanceof Error ? error.message : "Failed to submit form";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
