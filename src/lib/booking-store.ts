import { promises as fs } from "fs";
import path from "path";
import type { BookingEnquiry, EnquiryStatus, VerificationStatus, DepositStatus } from "./booking-types";
import { createReferenceNumber } from "./utils";

const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "thickzlove-bookings")
  : path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "bookings.json");

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(STORE_PATH);
  } catch {
    await fs.writeFile(STORE_PATH, "[]", "utf8");
  }
}

export async function readBookings(): Promise<BookingEnquiry[]> {
  try {
    await ensureStore();
    const raw = await fs.readFile(STORE_PATH, "utf8");
    try {
      return JSON.parse(raw) as BookingEnquiry[];
    } catch {
      return [];
    }
  } catch {
    // Serverless FS may be unavailable; never crash the admin dashboard.
    return [];
  }
}

async function writeBookings(bookings: BookingEnquiry[]) {
  await ensureStore();
  await fs.writeFile(STORE_PATH, JSON.stringify(bookings, null, 2), "utf8");
}

export async function createBooking(
  input: Omit<
    BookingEnquiry,
    | "id"
    | "referenceNumber"
    | "verificationStatus"
    | "enquiryStatus"
    | "depositStatus"
    | "internalNotes"
    | "blocked"
    | "createdAt"
    | "updatedAt"
  >,
): Promise<BookingEnquiry> {
  const now = new Date().toISOString();
  const booking: BookingEnquiry = {
    ...input,
    id: crypto.randomUUID(),
    referenceNumber: createReferenceNumber(),
    verificationStatus: "Not requested",
    enquiryStatus: "New",
    depositStatus: "Not requested",
    internalNotes: "",
    blocked: false,
    createdAt: now,
    updatedAt: now,
  };

  const all = await readBookings();
  all.unshift(booking);
  await writeBookings(all);
  return booking;
}

export async function getBookingById(id: string) {
  const all = await readBookings();
  return all.find((b) => b.id === id);
}

export async function updateBooking(
  id: string,
  patch: Partial<
    Pick<
      BookingEnquiry,
      | "enquiryStatus"
      | "verificationStatus"
      | "depositStatus"
      | "internalNotes"
      | "blocked"
    >
  >,
) {
  const all = await readBookings();
  const index = all.findIndex((b) => b.id === id);
  if (index === -1) return null;

  all[index] = {
    ...all[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await writeBookings(all);
  return all[index];
}

export async function deleteBooking(id: string) {
  const all = await readBookings();
  const next = all.filter((b) => b.id !== id);
  if (next.length === all.length) return false;
  await writeBookings(next);
  return true;
}

export const enquiryStatuses: EnquiryStatus[] = [
  "New",
  "Under review",
  "Awaiting information",
  "Screening required",
  "Awaiting verification",
  "Approved",
  "Declined",
  "Confirmed",
  "Completed",
  "Cancelled",
];

export const verificationStatuses: VerificationStatus[] = [
  "Not requested",
  "Verification requested",
  "Verification in progress",
  "Verified",
  "Rejected",
  "Expired",
];

export const depositStatuses: DepositStatus[] = [
  "Not requested",
  "Awaiting deposit",
  "Received",
  "Refunded",
  "Waived",
];
