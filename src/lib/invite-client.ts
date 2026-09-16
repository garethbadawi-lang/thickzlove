import { randomBytes } from "crypto";
import { auth } from "@/lib/auth/server";
import { getSql } from "@/lib/db";
import { SITE_KEY, SITE_DISPLAY_NAME } from "@/lib/site";
import { ensureSiteRecord, linkSiteAdmin, completeSiteAdminProfile } from "@/lib/site-access";

function appOrigin(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
  return (fromEnv || "https://thickzlove.vercel.app").replace(/\/$/, "");
}

export function getPasswordResetRedirectUrl(): string {
  return `${appOrigin()}/admin/reset-password`;
}

/** Cryptographically random temporary password — never logged or returned. */
export function generateTempPassword(): string {
  return `Tmp-${randomBytes(24).toString("base64url")}!aA1`;
}

export async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT id
    FROM neon_auth.user
    WHERE lower(email) = lower(${email.trim()})
    LIMIT 1
  `;
  return rows[0]?.id ? String(rows[0].id) : null;
}

/**
 * Create (or reuse) a Neon Auth user, link to thickzlove, and send a password
 * setup/reset email so the client chooses their own password.
 */
export async function inviteSiteClient(input: {
  email: string;
  displayName?: string | null;
  originHeader?: string | null;
}): Promise<{ authUserId: string; created: boolean }> {
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid email address.");
  }

  await ensureSiteRecord(SITE_KEY, SITE_DISPLAY_NAME);

  let authUserId = await findAuthUserIdByEmail(email);
  let created = false;

  if (!authUserId) {
    const tempPassword = generateTempPassword();
    const name =
      input.displayName?.trim() ||
      email.split("@")[0] ||
      SITE_DISPLAY_NAME;

    const { data, error } = await auth.signUp.email({
      email,
      password: tempPassword,
      name,
    });

    if (error) {
      // Race: user may have been created concurrently
      authUserId = await findAuthUserIdByEmail(email);
      if (!authUserId) {
        throw new Error(error.message || "Unable to create account.");
      }
    } else {
      authUserId = data?.user?.id ? String(data.user.id) : null;
      if (!authUserId) {
        authUserId = await findAuthUserIdByEmail(email);
      }
      if (!authUserId) {
        throw new Error("Unable to create account.");
      }
      created = true;
    }

    // Sign out any session created by signUp so invite doesn't leave a session.
    try {
      await auth.signOut();
    } catch {
      /* ignore */
    }
  }

  const linked = await linkSiteAdmin({
    authUserId,
    siteKey: SITE_KEY,
    role: "owner",
    displayName: input.displayName?.trim() || null,
  });
  if (!linked) {
    throw new Error("Unable to link account to this site.");
  }

  if (input.displayName?.trim()) {
    await completeSiteAdminProfile({
      authUserId,
      siteKey: SITE_KEY,
      displayName: input.displayName.trim(),
    });
  }

  // Send set-password / reset email (generic privacy-safe API).
  const origin = input.originHeader || appOrigin();
  const resetRes = await fetch(new URL("/api/auth/request-password-reset", origin), {
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

  if (!resetRes.ok) {
    // Fallback: call through Neon Auth SDK if available
    const forget = (auth as { forgetPassword?: (args: unknown) => Promise<unknown> })
      .forgetPassword;
    const requestReset = (
      auth as {
        requestPasswordReset?: (args: {
          email: string;
          redirectTo: string;
        }) => Promise<{ error?: { message?: string } | null }>;
      }
    ).requestPasswordReset;

    if (typeof requestReset === "function") {
      const { error } = await requestReset({
        email,
        redirectTo: getPasswordResetRedirectUrl(),
      });
      if (error) {
        throw new Error(
          "Account linked, but the invitation email could not be sent. Try Forgot password.",
        );
      }
    } else if (typeof forget === "function") {
      await forget({
        email,
        redirectTo: getPasswordResetRedirectUrl(),
      });
    } else {
      throw new Error(
        "Account linked, but the invitation email could not be sent. Try Forgot password.",
      );
    }
  }

  return { authUserId, created };
}
