import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeId, serviceName, customerName, customerEmail, customerPhone, date, time, notes } = body;

    if (
      !storeId ||
      typeof storeId !== "string" ||
      !serviceName ||
      typeof serviceName !== "string" ||
      !customerName ||
      typeof customerName !== "string" ||
      (!customerEmail && !customerPhone)
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (typeof date !== "string" || typeof time !== "string") {
      return NextResponse.json(
        { error: "date and time are required" },
        { status: 400 }
      );
    }

    const email =
      typeof customerEmail === "string" && customerEmail.trim()
        ? customerEmail.trim().toLowerCase()
        : undefined;
    const phone = typeof customerPhone === "string" && customerPhone.trim() ? customerPhone.trim() : undefined;
    const bookingDateTime = new Date(`${date}T${time}`);
    if (Number.isNaN(bookingDateTime.getTime())) {
      return NextResponse.json(
        { error: "Invalid date or time format" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        storeId,
        serviceName: serviceName.trim(),
        customerName: customerName.trim(),
        customerEmail: email,
        customerPhone: phone,
        startTime: bookingDateTime,
        endTime: new Date(bookingDateTime.getTime() + 60 * 60 * 1000), // Default 1 hour
        status: "PENDING",
        notes: typeof notes === "string" ? notes.trim() : undefined,
      },
    });

    // Also create/update lead
    await prisma.lead.upsert({
      where: { 
        storeId_email: { 
          storeId, 
          email: email || `no-email-${phone || "unknown"}@bdesh.shop` 
        } 
      },
      update: {
        phone: phone || undefined,
        name: customerName.trim(),
      },
      create: {
        storeId,
        email: email || `no-email-${phone || "unknown"}@bdesh.shop`,
        phone,
        name: customerName.trim(),
        source: "BOOKING",
      },
    });

    return NextResponse.json({ success: true, id: booking.id });
  } catch (error: unknown) {
    console.error("Booking error:", error);
    const message = error instanceof Error ? error.message : "Failed to create booking";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
