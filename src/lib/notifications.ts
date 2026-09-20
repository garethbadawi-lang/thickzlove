import { Resend } from "resend";
import type { BookingEnquiry } from "@/lib/booking-types";

/**
 * Email notification preparation for booking/contact forms.
 *
 * Recipients are read only from environment variables — never hard-coded.
 * No mail provider is active yet; when a recipient is unset, notifications
 * are skipped silently so form submissions keep working.
 *
 * Activate later by setting:
 *   BOOKING_NOTIFICATION_EMAIL
 *   CONTACT_NOTIFICATION_EMAIL
 * and wiring a mail provider in a follow-up step.
 */

export type PreparedEmail = {
  to: string;
  subject: string;
  text: string;
};


function stripEnvQuotes(value: string): string {
  return value.trim().replace(/^["']|["']$/g, "");
}

function readEnv(...names: string[]): string | null {
  for (const name of names) {
    const value = process.env[name];
    if (!value) continue;
    const cleaned = stripEnvQuotes(value);
    if (cleaned) return cleaned;
  }
  return null;
}

function getFromAddress(fallbackBrand: string): string {
  const from = readEnv("CONTACT_FROM_EMAIL", "AUTH_EMAIL_FROM", "EMAIL_FROM");
  if (from) {
    if (from.includes("<")) return from;
    const display = readEnv("EMAIL_FROM_NAME") || fallbackBrand;
    return `${display} <${from}>`;
  }
  return `${fallbackBrand} <enquiries@contactdesk.online>`;
}

async function sendPreparedEmail(
  prepared: PreparedEmail,
  replyTo: string | undefined,
  brand: string,
): Promise<void> {
  const apiKey = readEnv("RESEND_API_KEY");
  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.info("[notification] RESEND_API_KEY missing; skipped send", {
        subject: prepared.subject,
      });
    }
    return;
  }
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: getFromAddress(brand),
      to: prepared.to,
      replyTo,
      subject: prepared.subject,
      text: prepared.text,
    });
    if (error) {
      console.error("[notification] Resend rejected send", {
        name: error.name,
        message: error.message,
      });
    }
  } catch (err) {
    console.error(
      "[notification] send failed",
      err instanceof Error ? err.message : "unknown error",
    );
  }
}


export function getBookingNotificationEmail(): string | null {
  return readEnv("BOOKING_NOTIFICATION_EMAIL", "CONTACT_TO_EMAIL", "CONTACT_NOTIFICATION_EMAIL");
}

export function getContactNotificationEmail(): string | null {
  return readEnv("CONTACT_TO_EMAIL", "CONTACT_NOTIFICATION_EMAIL");
}

export function buildBookingNotificationEmail(
  booking: BookingEnquiry,
): PreparedEmail | null {
  const to = getBookingNotificationEmail();
  if (!to) return null;

  const lines = [
    "New booking enquiry",
    "",
    `Reference: ${booking.referenceNumber}`,
    `Submitted: ${booking.createdAt}`,
    "",
    "— Contact —",
    `Full name: ${booking.fullName}`,
    `Preferred name: ${booking.preferredName || "—"}`,
    `Email: ${booking.email}`,
    `Mobile: ${booking.mobile}`,
    `Preferred contact method: ${booking.preferredContactMethod}`,
    `Country: ${booking.country}`,
    `City: ${booking.city}`,
    "",
    "— Request —",
    `Service: ${booking.serviceName} (${booking.serviceId})`,
    `Preferred date: ${booking.preferredDate}`,
    `Alternative date: ${booking.alternativeDate || "—"}`,
    `Preferred start time: ${booking.preferredStartTime || "—"}`,
    `Time window: ${booking.timeWindow || "—"}`,
    `Requested duration: ${booking.requestedDuration}`,
    `Attendees: ${booking.attendees}`,
    `Area: ${booking.area}`,
    `Venue type: ${booking.venueType}`,
    `Purpose: ${booking.purpose}`,
    `Dress preference: ${booking.dressPreference || "—"}`,
    `Event info: ${booking.eventInfo || "—"}`,
    `Accessibility: ${booking.accessibility || "—"}`,
    `Travel requirements: ${booking.travelRequirements || "—"}`,
    `How found: ${booking.howFound || "—"}`,
    "",
    "— Notes —",
    booking.additionalNotes || "—",
  ];

  return {
    to,
    subject: `New booking enquiry ${booking.referenceNumber}`,
    text: lines.join("\n"),
  };
}

export type ContactEnquiryPayload = {
  name: string;
  email: string;
  platform: string;
  enquiryType: string;
  experience: string;
  message: string;
  receivedAt: string;
};

export function buildContactNotificationEmail(
  enquiry: ContactEnquiryPayload,
): PreparedEmail | null {
  const to = getContactNotificationEmail();
  if (!to) return null;

  const lines = [
    "New contact enquiry",
    "",
    `Submitted: ${enquiry.receivedAt}`,
    "",
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Platform: ${enquiry.platform || "—"}`,
    `Enquiry type: ${enquiry.enquiryType || "—"}`,
    `Experience: ${enquiry.experience || "—"}`,
    "",
    "— Message —",
    enquiry.message,
  ];

  return {
    to,
    subject: `New contact enquiry from ${enquiry.name}`,
    text: lines.join("\n"),
  };
}

/**
 * Prepare a booking email notification when BOOKING_NOTIFICATION_EMAIL is set.
 * Does not send mail yet — provider wiring is a follow-up step.
 * Missing recipient = silent no-op (forms keep working).
 */
export async function notifyBookingEnquiry(
  booking: BookingEnquiry,
): Promise<void> {
  const prepared = buildBookingNotificationEmail(booking);
  if (!prepared) return;
  await sendPreparedEmail(prepared, booking.email, "Love Z Thick");
}

/**
 * Prepare a contact email notification when CONTACT_NOTIFICATION_EMAIL is set.
 * Does not send mail yet — provider wiring is a follow-up step.
 * Missing recipient = silent no-op.
 */
export async function notifyContactEnquiry(
  enquiry: ContactEnquiryPayload,
): Promise<void> {
  const prepared = buildContactNotificationEmail(enquiry);
  if (!prepared) return;
  await sendPreparedEmail(prepared, enquiry.email, "Love Z Thick");
}
