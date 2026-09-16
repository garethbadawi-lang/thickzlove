import { NextResponse } from "next/server";
import { createBooking } from "@/lib/booking-store";
import type { BookingFormPayload } from "@/lib/booking-types";
import { notifyBookingEnquiry } from "@/lib/notifications";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { validateBookingPayload } from "@/lib/validate-booking";
import { getPublicServiceById } from "@/lib/public-content";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    if (isRateLimited(ip, 5, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before trying again." },
        { status: 429 },
      );
    }

    const body = (await req.json()) as Partial<BookingFormPayload>;

    if (body.website) {
      return NextResponse.json({ ok: true, referenceNumber: "RECEIVED" });
    }

    const errors = await validateBookingPayload(body);
    if (errors.length) {
      return NextResponse.json({ error: errors[0] }, { status: 400 });
    }

    const service = await getPublicServiceById(String(body.serviceId));
    if (!service) {
      return NextResponse.json({ error: "Invalid service." }, { status: 400 });
    }

    const booking = await createBooking({
      fullName: String(body.fullName).trim(),
      preferredName: String(body.preferredName || "").trim(),
      email: String(body.email).trim(),
      mobile: String(body.mobile).trim(),
      country: String(body.country).trim(),
      city: String(body.city).trim(),
      preferredContactMethod: String(body.preferredContactMethod).trim(),
      serviceId: service.id,
      serviceName: service.name,
      preferredDate: String(body.preferredDate).trim(),
      alternativeDate: String(body.alternativeDate || "").trim(),
      preferredStartTime: String(body.preferredStartTime || "").trim(),
      requestedDuration: String(body.requestedDuration).trim(),
      attendees: String(body.attendees).trim(),
      area: String(body.area).trim(),
      venueType: String(body.venueType).trim(),
      purpose: String(body.purpose).trim(),
      dressPreference: String(body.dressPreference || "").trim(),
      eventInfo: String(body.eventInfo || "").trim(),
      accessibility: String(body.accessibility || "").trim(),
      additionalNotes: String(body.additionalNotes || "").trim(),
      travelRequirements: String(body.travelRequirements || "").trim(),
      howFound: String(body.howFound || "").trim(),
      timeWindow: String(body.timeWindow || "").trim(),
    });

    // Email notification is prepared only when BOOKING_NOTIFICATION_EMAIL is set.
    // No recipient / no mail provider = silent skip; local storage still succeeds.
    await notifyBookingEnquiry(booking);

    if (process.env.BOOKING_WEBHOOK_URL) {
      await fetch(process.env.BOOKING_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceNumber: booking.referenceNumber,
          serviceName: booking.serviceName,
          preferredDate: booking.preferredDate,
          email: booking.email,
          receivedAt: booking.createdAt,
        }),
      });
    } else if (process.env.NODE_ENV === "development") {
      console.info("[booking]", {
        referenceNumber: booking.referenceNumber,
        serviceName: booking.serviceName,
        preferredDate: booking.preferredDate,
      });
    }

    return NextResponse.json({
      ok: true,
      referenceNumber: booking.referenceNumber,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to process enquiry." },
      { status: 500 },
    );
  }
}
