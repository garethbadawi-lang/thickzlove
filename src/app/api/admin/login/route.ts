import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  createAdminSessionToken,
  getAdminCookieOptions,
  isAdminAuthenticated,
  verifyAdminCredentials,
} from "@/lib/admin-auth";
import {
  appendAdminAuditEvent,
  parseClientInfo,
} from "@/lib/adminAuditLog";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const client = parseClientInfo(req);
  const ip = client.ip !== "unknown" ? client.ip : getClientIp(req);

  if (isRateLimited(`admin-login:${ip}`, 8, 60_000)) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = (await req.json()) as { username?: string; password?: string };
  } catch {
    await appendAdminAuditEvent({
      event: "ADMIN_LOGIN_FAILED",
      success: false,
      client,
    });
    return NextResponse.json(
      { error: "Invalid username or password." },
      { status: 401 },
    );
  }

  const username = String(body.username || "");
  const password = String(body.password || "");

  const ok = await verifyAdminCredentials(username, password);
  if (!ok) {
    await appendAdminAuditEvent({
      event: "ADMIN_LOGIN_FAILED",
      success: false,
      client,
    });
    return NextResponse.json(
      { error: "Invalid username or password." },
      { status: 401 },
    );
  }

  let token: string;
  try {
    token = createAdminSessionToken();
  } catch {
    await appendAdminAuditEvent({
      event: "ADMIN_LOGIN_FAILED",
      success: false,
      client,
    });
    return NextResponse.json(
      { error: "Invalid username or password." },
      { status: 401 },
    );
  }

  await appendAdminAuditEvent({
    event: "ADMIN_LOGIN_SUCCESS",
    success: true,
    client,
    sessionToken: token,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, getAdminCookieOptions());
  return res;
}

export async function DELETE(req: Request) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = parseClientInfo(req);
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;

  await appendAdminAuditEvent({
    event: "ADMIN_LOGOUT",
    success: true,
    client,
    sessionToken: token || null,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", {
    ...getAdminCookieOptions(0),
    maxAge: 0,
  });
  return res;
}
