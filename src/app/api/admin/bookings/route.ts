import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  deleteBooking,
  depositStatuses,
  enquiryStatuses,
  readBookings,
  updateBooking,
  verificationStatuses,
} from "@/lib/booking-store";
import type {
  DepositStatus,
  EnquiryStatus,
  VerificationStatus,
} from "@/lib/booking-types";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const bookings = await readBookings();
  return NextResponse.json({ bookings });
}

export async function PATCH(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    id?: string;
    enquiryStatus?: EnquiryStatus;
    verificationStatus?: VerificationStatus;
    depositStatus?: DepositStatus;
    internalNotes?: string;
    blocked?: boolean;
  };

  if (!body.id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  if (
    body.enquiryStatus &&
    !enquiryStatuses.includes(body.enquiryStatus)
  ) {
    return NextResponse.json({ error: "Invalid enquiry status" }, { status: 400 });
  }
  if (
    body.verificationStatus &&
    !verificationStatuses.includes(body.verificationStatus)
  ) {
    return NextResponse.json(
      { error: "Invalid verification status" },
      { status: 400 },
    );
  }
  if (body.depositStatus && !depositStatuses.includes(body.depositStatus)) {
    return NextResponse.json({ error: "Invalid deposit status" }, { status: 400 });
  }

  const updated = await updateBooking(body.id, {
    enquiryStatus: body.enquiryStatus,
    verificationStatus: body.verificationStatus,
    depositStatus: body.depositStatus,
    internalNotes: body.internalNotes,
    blocked: body.blocked,
  });

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ booking: updated });
}

export async function DELETE(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const ok = await deleteBooking(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
