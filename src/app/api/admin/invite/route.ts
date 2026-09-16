import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  appendAdminAuditEvent,
  parseClientInfo,
} from "@/lib/adminAuditLog";
import { inviteSiteClient } from "@/lib/invite-client";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { SITE_KEY } from "@/lib/site";

function resolveOrigin(req: Request): string {
  const fromHeader = req.headers.get("origin")?.trim();
  if (fromHeader) return fromHeader;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto =
    req.headers.get("x-forwarded-proto") ||
    (host?.includes("localhost") ? "http" : "https");
  if (host) return `${proto}://${host.split(",")[0].trim()}`;
  return "https://thickzlove.vercel.app";
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = parseClientInfo(req);
  const ip = client.ip !== "unknown" ? client.ip : getClientIp(req);
  if (isRateLimited(`admin-invite:${ip}`, 10, 60_000)) {
    return NextResponse.json(
      { error: "Too many invites. Please try again later." },
      { status: 429 },
    );
  }

  let body: { email?: string; displayName?: string };
  try {
    body = (await req.json()) as { email?: string; displayName?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = String(body.email || "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  try {
    const result = await inviteSiteClient({
      email,
      displayName: body.displayName || null,
      originHeader: resolveOrigin(req),
    });

    await appendAdminAuditEvent({
      event: "CLIENT_INVITED",
      success: true,
      client,
      siteKey: SITE_KEY,
      authUserId: result.authUserId,
    });

    return NextResponse.json({
      ok: true,
      created: result.created,
      message:
        "Invitation sent. If that email can receive mail from this sender, they will get a link to choose their password.",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unable to invite client.";
    await appendAdminAuditEvent({
      event: "CLIENT_INVITED",
      success: false,
      client,
      siteKey: SITE_KEY,
    });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
