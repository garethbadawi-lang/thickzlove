import { promises as fs } from "fs";
import path from "path";
import { get, put } from "@vercel/blob";
import type {
  BookingEnquiry,
  EnquiryStatus,
  VerificationStatus,
  DepositStatus,
} from "./booking-types";
import { createReferenceNumber } from "./utils";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "bookings.json");
const BLOB_PATHNAME = "data/bookings.json";

/**
 * Local: .data/bookings.json
 * Vercel: private Vercel Blob (durable across deploys/instances)
 */
function isBlobStorageEnabled() {
  return (
    process.env.VERCEL === "1" &&
    Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)
  );
}

async function ensureLocalStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(STORE_PATH);
  } catch {
    await fs.writeFile(STORE_PATH, "[]", "utf8");
  }
}

async function readBookingsFromFile(): Promise<BookingEnquiry[]> {
  await ensureLocalStore();
  const raw = await fs.readFile(STORE_PATH, "utf8");
  try {
    const parsed = JSON.parse(raw) as BookingEnquiry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeBookingsToFile(bookings: BookingEnquiry[]) {
  await ensureLocalStore();
  await fs.writeFile(STORE_PATH, JSON.stringify(bookings, null, 2), "utf8");
}

async function readBookingsFromBlob(): Promise<BookingEnquiry[]> {
  const result = await get(BLOB_PATHNAME, {
    access: "private",
    useCache: false,
  });

  if (!result || !result.stream) {
    return [];
  }

  const raw = await new Response(result.stream).text();
  if (!raw.trim()) return [];

  try {
    const parsed = JSON.parse(raw) as BookingEnquiry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    throw new Error("Bookings blob contains invalid JSON.");
  }
}

async function writeBookingsToBlob(bookings: BookingEnquiry[]) {
  await put(BLOB_PATHNAME, JSON.stringify(bookings, null, 2), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}

export async function readBookings(): Promise<BookingEnquiry[]> {
  if (isBlobStorageEnabled()) {
    return readBookingsFromBlob();
  }
  return readBookingsFromFile();
}

async function writeBookings(bookings: BookingEnquiry[]) {
  if (isBlobStorageEnabled()) {
    await writeBookingsToBlob(bookings);
    return;
  }
  await writeBookingsToFile(bookings);
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
