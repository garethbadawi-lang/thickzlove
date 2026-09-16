import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export const COOKIE_NAME = "lzt_admin_session";
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

/** Valid bcrypt hash used only so compare still takes time when env is misconfigured. */
const DUMMY_PASSWORD_HASH =
  "$2b$12$0ZFynKACBARo.Cq6Xrf/NOx542kQMWJ5QniODmx7b2YGsW4FNJjUy";

function getSessionSecret(): string | null {
  const value = process.env.ADMIN_SESSION_SECRET?.trim();
  return value || null;
}

function getAdminUsername(): string | null {
  const value = process.env.ADMIN_USERNAME?.trim();
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
    // Still compare equal-length buffers to reduce length oracle noise.
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
 * Verify username + password against server-only env.
 * Never logs credentials. Returns a single boolean (generic failure).
 */
export async function verifyAdminCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const expectedUser = getAdminUsername();
  const passwordHash = getPasswordHash();
  const secret = getSessionSecret();

  if (!expectedUser || !passwordHash || !secret) {
    // Misconfigured server: fail closed, but still run a compare for timing.
    await bcrypt.compare(password || "x", DUMMY_PASSWORD_HASH).catch(() => false);
    return false;
  }

  const userOk = timingSafeEqualString(username.trim(), expectedUser);
  let passOk = false;
  try {
    passOk = await bcrypt.compare(password, passwordHash);
  } catch {
    passOk = false;
  }

  return userOk && passOk;
}

export function createAdminSessionToken(): string {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured");
  }
  const expiresAt = Date.now() + SESSION_MAX_AGE_SEC * 1000;
  const payload = `admin:${expiresAt}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function isValidAdminToken(token: string | undefined): boolean {
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
  if (parts.length !== 2 || parts[0] !== "admin") return false;
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
    if (parts.length !== 2 || parts[0] !== "admin") return false;
    const expiresAt = Number(parts[1]);
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
    return true;
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return isValidAdminToken(jar.get(COOKIE_NAME)?.value);
}

/** Server Components / layouts: redirect to login when unauthenticated. */
export async function requireAdminSession(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
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
