import { NextResponse } from "next/server";
import { getAdminAccess } from "@/lib/admin-auth";
import {
  appendAdminAuditEvent,
  parseClientInfo,
} from "@/lib/adminAuditLog";
import { looksLikeEmail } from "@/lib/bootstrap";
import { inviteSiteClient } from "@/lib/invite-client";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { SITE_KEY } from "@/lib/site";
import {
  getSiteByKey,
  isBootstrapMigrated,
  setBootstrapPending,
  updateSiteContactEmail,
} from "@/lib/site-access";

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

/** Status for the bootstrap / first-time client setup flow. */
export async function GET() {
  const access = await getAdminAccess();
  if (!access) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (access.mode === "neon") {
    return NextResponse.json({
      mode: "neon",
      profileComplete: access.profileComplete,
      email: access.email,
      displayName: access.membership?.displayName || access.name || "",
    });
  }

  const site = await getSiteByKey(SITE_KEY);
  const migrated = Boolean(site?.bootstrapMigratedAt);

  return NextResponse.json({
    mode: "bootstrap",
    migrated,
    pendingEmail: site?.bootstrapPendingEmail || null,
    pendingDisplayName: site?.bootstrapPendingDisplayName || null,
    emailSubmitted: Boolean(site?.bootstrapPendingEmail),
  });
}

/**
 * Client starter setup: collect email + display name, create/link Neon Auth
 * user for thickzlove, and send the verification / set-password email.
 * Does NOT disable lovezthick until migration is sealed on first Neon login.
 */
export async function POST(req: Request) {
  const access = await getAdminAccess();
  if (!access || access.mode !== "bootstrap") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (await isBootstrapMigrated(SITE_KEY)) {
    return NextResponse.json(
      {
        error:
          "Starter setup is complete. Sign in with your email and password.",
      },
      { status: 400 },
    );
  }

  const client = parseClientInfo(req);
  const ip = client.ip !== "unknown" ? client.ip : getClientIp(req);
  if (isRateLimited(`admin-bootstrap:${ip}`, 8, 60_000)) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  let body: { email?: string; displayName?: string; action?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const action = String(body.action || "submit_email");
  if (action !== "submit_email" && action !== "resend_email") {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  const site = await getSiteByKey(SITE_KEY);
  let email = String(body.email || site?.bootstrapPendingEmail || "")
    .trim()
    .toLowerCase();
  let displayName = String(
    body.displayName || site?.bootstrapPendingDisplayName || "",
  ).trim();

  if (!looksLikeEmail(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  if (displayName.length < 2) {
    return NextResponse.json(
      { error: "Enter a display name (at least 2 characters)." },
      { status: 400 },
    );
  }

  try {
    const result = await inviteSiteClient({
      email,
      displayName,
      originHeader: resolveOrigin(req),
    });

    await setBootstrapPending({
      email,
      displayName,
      authUserId: result.authUserId,
    });
    await updateSiteContactEmail(SITE_KEY, email);

    await appendAdminAuditEvent({
      event: "CLIENT_EMAIL_SUBMITTED",
      success: true,
      client,
      siteKey: SITE_KEY,
      authUserId: result.authUserId,
    });

    return NextResponse.json({
      ok: true,
      email,
      message:
        "Check your email for a secure link to verify your address and choose your permanent password. You can keep using your starter login until that is finished.",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unable to start account setup.";
    await appendAdminAuditEvent({
      event: "CLIENT_EMAIL_SUBMITTED",
      success: false,
      client,
      siteKey: SITE_KEY,
    });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
