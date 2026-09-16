import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { isNeonAuthConfigured, auth } from "@/lib/auth/server";
import { BOOTSTRAP_USERNAME } from "@/lib/bootstrap";
import {
  getSiteAdminLink,
  isBootstrapMigrated,
  isProfileComplete,
  markBootstrapMigrated,
  type SiteAdminLink,
} from "@/lib/site-access";
import { SITE_KEY } from "@/lib/site";

export const COOKIE_NAME = "lzt_admin_session";
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

const DUMMY_PASSWORD_HASH =
  "$2b$12$0ZFynKACBARo.Cq6Xrf/NOx542kQMWJ5QniODmx7b2YGsW4FNJjUy";

export type AdminAccess =
  | {
      mode: "neon";
      authUserId: string;
      siteKey: string;
      email?: string | null;
      name?: string | null;
      membership: SiteAdminLink;
      profileComplete: boolean;
    }
  | {
      mode: "bootstrap";
      siteKey: string;
      authUserId?: undefined;
      email?: undefined;
      name?: undefined;
      membership?: undefined;
      /** Bootstrap must finish email migration before dashboard. */
      profileComplete: false;
    };

function getSessionSecret(): string | null {
  const value = process.env.ADMIN_SESSION_SECRET?.trim();
  return value || null;
}

function getPasswordHash(): string | null {
  const value = process.env.ADMIN_PASSWORD_HASH?.trim();
  return value || null;
}

function timingSafeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    const padded = Buffer.alloc(bufA.length);
    timingSafeEqual(bufA, padded);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Verify lovezthick bootstrap username + password against ADMIN_PASSWORD_HASH.
 * Only the bootstrap username is accepted — not arbitrary legacy usernames.
 */
export async function verifyBootstrapCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const passwordHash = getPasswordHash();
  const secret = getSessionSecret();

  if (!passwordHash || !secret) {
    await bcrypt.compare(password || "x", DUMMY_PASSWORD_HASH).catch(() => false);
    return false;
  }

  const userOk = timingSafeEqualString(
    username.trim().toLowerCase(),
    BOOTSTRAP_USERNAME,
  );
  let passOk = false;
  try {
    passOk = await bcrypt.compare(password, passwordHash);
  } catch {
    passOk = false;
  }

  return userOk && passOk;
}

/** @deprecated Use verifyBootstrapCredentials — kept for any leftover imports. */
export async function verifyAdminCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  return verifyBootstrapCredentials(username, password);
}

export function createBootstrapSessionToken(): string {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured");
  }
  const expiresAt = Date.now() + SESSION_MAX_AGE_SEC * 1000;
  const payload = `bootstrap:${expiresAt}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function isValidBootstrapToken(token: string | undefined): boolean {
  if (!token) return false;
  const secret = getSessionSecret();
  if (!secret) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload, secret);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    if (!timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }

  const parts = payload.split(":");
  if (parts.length !== 2 || parts[0] !== "bootstrap") return false;
  const expiresAt = Number(parts[1]);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  return true;
}

/** Edge-safe async verify for middleware (Web Crypto HMAC-SHA256). */
export async function isValidAdminTokenEdge(
  token: string | undefined,
  secret: string | undefined,
): Promise<boolean> {
  if (!token || !secret) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sigBuf = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(payload),
    );
    const expected = Array.from(new Uint8Array(sigBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const a = new TextEncoder().encode(signature);
    const b = new TextEncoder().encode(expected);
    if (a.length !== b.length) return false;
    let mismatch = 0;
    for (let i = 0; i < a.length; i += 1) mismatch |= a[i]! ^ b[i]!;
    if (mismatch !== 0) return false;

    const parts = payload.split(":");
    if (parts.length !== 2 || (parts[0] !== "bootstrap" && parts[0] !== "admin")) {
      return false;
    }
    const expiresAt = Number(parts[1]);
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
    return true;
  } catch {
    return false;
  }
}

export async function getAdminAccess(): Promise<AdminAccess | null> {
  if (isNeonAuthConfigured()) {
    try {
      const { data: session } = await auth.getSession();
      const userId = session?.user?.id ? String(session.user.id) : null;
      if (userId) {
        const membership = await getSiteAdminLink(userId, SITE_KEY);
        if (membership) {
          // If this Neon user is the pending bootstrap migration target, seal migration.
          try {
            await markBootstrapMigrated({ authUserId: userId });
          } catch {
            /* ignore */
          }

          return {
            mode: "neon",
            authUserId: userId,
            siteKey: SITE_KEY,
            email: session?.user?.email ? String(session.user.email) : null,
            name: session?.user?.name ? String(session.user.name) : null,
            membership,
            profileComplete: isProfileComplete(membership),
          };
        }
      }
    } catch (err) {
      console.error("[admin-auth] Neon session check failed", err);
    }
  }

  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (isValidBootstrapToken(token)) {
    if (await isBootstrapMigrated(SITE_KEY)) {
      return null;
    }
    return {
      mode: "bootstrap",
      siteKey: SITE_KEY,
      profileComplete: false,
    };
  }

  return null;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  return (await getAdminAccess()) !== null;
}

export async function requireAdminSession(options?: {
  allowIncompleteProfile?: boolean;
}): Promise<AdminAccess> {
  const access = await getAdminAccess();
  if (!access) {
    redirect("/admin/login");
  }

  const needsSetup =
    access.mode === "bootstrap" ||
    (access.mode === "neon" && !access.profileComplete);

  if (needsSetup && !options?.allowIncompleteProfile) {
    redirect("/admin/account/setup");
  }

  return access;
}

export function getAdminCookieOptions(maxAge = SESSION_MAX_AGE_SEC) {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function isBootstrapAuthConfigured(): boolean {
  return Boolean(getPasswordHash() && getSessionSecret());
}
