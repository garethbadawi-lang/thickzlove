import { NextResponse } from "next/server";
import {
  appendAdminAuditEvent,
  parseClientInfo,
} from "@/lib/adminAuditLog";
import { SITE_KEY } from "@/lib/site";

/** Records PASSWORD_CHANGED after a successful reset. Never accepts tokens. */
export async function POST(req: Request) {
  const client = parseClientInfo(req);
  await appendAdminAuditEvent({
    event: "PASSWORD_CHANGED",
    success: true,
    client,
    siteKey: SITE_KEY,
  });
  return NextResponse.json({ ok: true });
}
