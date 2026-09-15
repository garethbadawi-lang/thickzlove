import type { BookingFormPayload } from "./booking-types";
import { getServiceById } from "@/data/services";
import { venueTypes } from "./booking-types";

export function validateBookingPayload(body: Partial<BookingFormPayload>) {
  const errors: string[] = [];

  const required: Array<keyof BookingFormPayload> = [
    "fullName",
    "email",
    "mobile",
    "country",
    "city",
    "preferredContactMethod",
    "serviceId",
    "preferredDate",
    "requestedDuration",
    "attendees",
    "area",
    "venueType",
    "purpose",
  ];

  for (const key of required) {
    if (!String(body[key] ?? "").trim()) {
      errors.push(`Missing field: ${key}`);
    }
  }

  if (!body.ageConfirmed) {
    errors.push("Age confirmation is required.");
  }
  if (!body.understandNotConfirmed) {
    errors.push("Please confirm you understand this is an enquiry only.");
  }
  if (!body.understandCompanionshipOnly) {
    errors.push("Please confirm companionship-only understanding.");
  }
  if (!body.agreeRespectful) {
    errors.push("Please agree to respectful conduct.");
  }
  if (!body.agreeTerms) {
    errors.push("Please confirm you have read the terms.");
  }

  const email = String(body.email || "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Invalid email address.");
  }

  if (body.serviceId && !getServiceById(body.serviceId)) {
    errors.push("Invalid service selection.");
  }

  if (body.venueType && !venueTypes.includes(body.venueType as (typeof venueTypes)[number])) {
    errors.push("Invalid venue type.");
  }

  const lengths: Array<[keyof BookingFormPayload, number]> = [
    ["fullName", 80],
    ["preferredName", 80],
    ["email", 120],
    ["mobile", 40],
    ["country", 80],
    ["city", 80],
    ["area", 120],
    ["purpose", 500],
    ["dressPreference", 300],
    ["eventInfo", 800],
    ["accessibility", 400],
    ["additionalNotes", 1500],
    ["travelRequirements", 500],
    ["howFound", 200],
  ];

  for (const [key, max] of lengths) {
    if (String(body[key] ?? "").length > max) {
      errors.push(`${key} is too long.`);
    }
  }

  return errors;
}
