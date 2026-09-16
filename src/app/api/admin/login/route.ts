import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  createBootstrapSessionToken,
  getAdminAccess,
  getAdminCookieOptions,
  isBootstrapAuthConfigured,
  verifyBootstrapCredentials,
} from "@/lib/admin-auth";
import { auth, isNeonAuthConfigured } from "@/lib/auth/server";
import {
  appendAdminAuditEvent,
  parseClientInfo,
} from "@/lib/adminAuditLog";
import { BOOTSTRAP_USERNAME, looksLikeEmail } from "@/lib/bootstrap";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { cookies } from "next/headers";
import { SITE_KEY } from "@/lib/site";
import {
  ensureSiteRecord,
  getSiteAdminLink,
  isBootstrapMigrated,
  isProfileComplete,
  isUserAuthorizedForSite,
  markBootstrapMigrated,
} from "@/lib/site-access";

function resolveRequestOrigin(req: Request): string {
  const fromHeader = req.headers.get("origin")?.trim();
  if (fromHeader) return fromHeader;

  const referer = req.headers.get("referer")?.trim();
  if (referer) {
    try {
      return new URL(referer).origin;
    } catch {
      /* ignore */
    }
  }

  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || req.headers.get("host")?.trim();
  if (host) {
    const proto =
      req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
      (host.startsWith("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https");
    return `${proto}://${host}`;
  }

  return new URL(req.url).origin;
}

type NeonSignInResult =
  | { ok: true; authUserId: string; setCookies: string[] }
  | { ok: false; reason: "credentials" | "error" };

async function neonSignIn(
  req: Request,
  email: string,
  password: string,
): Promise<NeonSignInResult> {
  const hasOrigin = Boolean(req.headers.get("origin")?.trim());

  if (hasOrigin) {
    const { data, error } = await auth.signIn.email({ email, password });
    if (error) return { ok: false, reason: "credentials" };
    const authUserId = data?.user?.id ? String(data.user.id) : null;
    if (!authUserId) return { ok: false, reason: "credentials" };
    return { ok: true, authUserId, setCookies: [] };
  }

  const origin = resolveRequestOrigin(req);
  const signInRes = await fetch(new URL("/api/auth/sign-in/email", origin), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      Cookie: req.headers.get("cookie") || "",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!signInRes.ok) return { ok: false, reason: "credentials" };

  let payload: { user?: { id?: string } } | null = null;
  try {
    payload = (await signInRes.json()) as { user?: { id?: string } };
  } catch {
    return { ok: false, reason: "error" };
  }

  const authUserId = payload?.user?.id ? String(payload.user.id) : null;
  if (!authUserId) return { ok: false, reason: "credentials" };

  return {
    ok: true,
    authUserId,
    setCookies: signInRes.headers.getSetCookie?.() || [],
  };
}

function applySetCookies(res: NextResponse, setCookies: string[]) {
  for (const raw of setCookies) {
    res.headers.append("Set-Cookie", raw);
  }
}

export async function POST(req: Request) {
  const client = parseClientInfo(req);
  const ip = client.ip !== "unknown" ? client.ip : getClientIp(req);

  if (isRateLimited(`admin-login:${ip}`, 8, 60_000)) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  let body: { email?: string; username?: string; password?: string };
  try {
    body = (await req.json()) as {
      email?: string;
      username?: string;
      password?: string;
    };
  } catch {
    await appendAdminAuditEvent({
      event: "ADMIN_LOGIN_FAILED",
      success: false,
      client,
      siteKey: SITE_KEY,
    });
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  const emailOrUser = String(body.email || body.username || "").trim();
  const password = String(body.password || "");

  if (!emailOrUser || !password) {
    await appendAdminAuditEvent({
      event: "ADMIN_LOGIN_FAILED",
      success: false,
      client,
      siteKey: SITE_KEY,
    });
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  // --- Permanent Neon Auth: email + password only ---
  if (looksLikeEmail(emailOrUser) && isNeonAuthConfigured()) {
    try {
      await ensureSiteRecord(SITE_KEY, "Love Z Thick");
      const neon = await neonSignIn(
        req,
        emailOrUser.toLowerCase(),
        password,
      );

      if (neon.ok) {
        const allowed = await isUserAuthorizedForSite(
          neon.authUserId,
          SITE_KEY,
        );
        if (!allowed) {
          try {
            if (neon.setCookies.length) {
              const origin = resolveRequestOrigin(req);
              const cookieHeader = neon.setCookies
                .map((c) => c.split(";")[0])
                .join("; ");
              await fetch(new URL("/api/auth/sign-out", origin), {
                method: "POST",
                headers: {
                  Origin: origin,
                  Cookie: cookieHeader,
                },
              });
            } else {
              await auth.signOut();
            }
          } catch {
            /* ignore */
          }
          await appendAdminAuditEvent({
            event: "ADMIN_LOGIN_FAILED",
            success: false,
            client,
            siteKey: SITE_KEY,
            authUserId: neon.authUserId,
          });
          return NextResponse.json(
            { error: "Invalid email or password." },
            { status: 401 },
          );
        }

        const migrated = await markBootstrapMigrated({
          authUserId: neon.authUserId,
        });
        if (migrated?.bootstrapMigratedAt) {
          await appendAdminAuditEvent({
            event: "CLIENT_EMAIL_VERIFIED",
            success: true,
            client,
            siteKey: SITE_KEY,
            authUserId: neon.authUserId,
          });
          await appendAdminAuditEvent({
            event: "CLIENT_ACCOUNT_MIGRATED",
            success: true,
            client,
            siteKey: SITE_KEY,
            authUserId: neon.authUserId,
          });
        }

        const membership = await getSiteAdminLink(neon.authUserId, SITE_KEY);
        const needsProfile = !isProfileComplete(membership);

        await appendAdminAuditEvent({
          event: "ADMIN_LOGIN_SUCCESS",
          success: true,
          client,
          siteKey: SITE_KEY,
          authUserId: neon.authUserId,
        });

        const res = NextResponse.json({
          ok: true,
          mode: "neon",
          requiresSetup: needsProfile,
        });
        applySetCookies(res, neon.setCookies);
        // Clear any leftover bootstrap cookie
        res.cookies.set(COOKIE_NAME, "", {
          ...getAdminCookieOptions(0),
          maxAge: 0,
        });
        return res;
      }

      await appendAdminAuditEvent({
        event: "ADMIN_LOGIN_FAILED",
        success: false,
        client,
        siteKey: SITE_KEY,
      });
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    } catch (err) {
      console.error("[admin-login] Neon Auth sign-in error", err);
      await appendAdminAuditEvent({
        event: "ADMIN_LOGIN_FAILED",
        success: false,
        client,
        siteKey: SITE_KEY,
      });
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }
  }

  // --- Client starter bootstrap: lovezthick only ---
  const normalizedUser = emailOrUser.toLowerCase();
  if (normalizedUser !== BOOTSTRAP_USERNAME) {
    await appendAdminAuditEvent({
      event: "ADMIN_LOGIN_FAILED",
      success: false,
      client,
      siteKey: SITE_KEY,
    });
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  if (!isBootstrapAuthConfigured()) {
    await appendAdminAuditEvent({
      event: "ADMIN_LOGIN_FAILED",
      success: false,
      client,
      siteKey: SITE_KEY,
    });
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  if (await isBootstrapMigrated(SITE_KEY)) {
    await appendAdminAuditEvent({
      event: "ADMIN_LOGIN_FAILED",
      success: false,
      client,
      siteKey: SITE_KEY,
    });
    return NextResponse.json(
      {
        error:
          "This starter login has been replaced. Sign in with your email and password.",
      },
      { status: 401 },
    );
  }

  const ok = await verifyBootstrapCredentials(normalizedUser, password);
  if (!ok) {
    await appendAdminAuditEvent({
      event: "ADMIN_LOGIN_FAILED",
      success: false,
      client,
      siteKey: SITE_KEY,
    });
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  let token: string;
  try {
    token = createBootstrapSessionToken();
  } catch {
    await appendAdminAuditEvent({
      event: "ADMIN_LOGIN_FAILED",
      success: false,
      client,
      siteKey: SITE_KEY,
    });
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  await appendAdminAuditEvent({
    event: "CLIENT_BOOTSTRAP_LOGIN",
    success: true,
    client,
    sessionToken: token,
    siteKey: SITE_KEY,
  });
  await appendAdminAuditEvent({
    event: "ADMIN_LOGIN_SUCCESS",
    success: true,
    client,
    sessionToken: token,
    siteKey: SITE_KEY,
  });

  const res = NextResponse.json({
    ok: true,
    mode: "bootstrap",
    requiresSetup: true,
  });
  res.cookies.set(COOKIE_NAME, token, getAdminCookieOptions());
  return res;
}

export async function DELETE(req: Request) {
  const access = await getAdminAccess();
  if (!access) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = parseClientInfo(req);
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;

  if (isNeonAuthConfigured() && access.mode === "neon") {
    try {
      await auth.signOut();
    } catch (err) {
      console.error("[admin-logout] Neon signOut failed", err);
    }
  }

  await appendAdminAuditEvent({
    event: "ADMIN_LOGOUT",
    success: true,
    client,
    sessionToken: token || null,
    siteKey: access.siteKey,
    authUserId: access.authUserId ?? null,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", {
    ...getAdminCookieOptions(0),
    maxAge: 0,
  });
  return res;
}
