import { NextResponse } from "next/server";
import {
  appendAdminAuditEvent,
  parseClientInfo,
} from "@/lib/adminAuditLog";
import { getPasswordResetRedirectUrl } from "@/lib/invite-client";
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

/**
 * Privacy-safe forgot-password request. Always returns the same message.
 * Never reveals whether the email exists. Never logs tokens.
 */
export async function POST(req: Request) {
  const client = parseClientInfo(req);
  const ip = client.ip !== "unknown" ? client.ip : getClientIp(req);

  if (isRateLimited(`admin-forgot:${ip}`, 5, 60_000)) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  let body: { email?: string };
  try {
    body = (await req.json()) as { email?: string };
  } catch {
    body = {};
  }

  const email = String(body.email || "").trim().toLowerCase();
  const generic = {
    ok: true,
    message:
      "If an account exists for that email, we've sent password reset instructions.",
  };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    await appendAdminAuditEvent({
      event: "PASSWORD_RESET_REQUESTED",
      success: false,
      client,
      siteKey: SITE_KEY,
    });
    return NextResponse.json(generic);
  }

  const origin = resolveOrigin(req);
  try {
    await fetch(new URL("/api/auth/request-password-reset", origin), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
      },
      body: JSON.stringify({
        email,
        redirectTo: getPasswordResetRedirectUrl(),
      }),
    });
  } catch {
    /* still return generic */
  }

  await appendAdminAuditEvent({
    event: "PASSWORD_RESET_REQUESTED",
    success: true,
    client,
    siteKey: SITE_KEY,
  });

  return NextResponse.json(generic);
}
