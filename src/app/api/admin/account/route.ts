import { NextResponse } from "next/server";
import { getAdminAccess } from "@/lib/admin-auth";
import { auth } from "@/lib/auth/server";
import {
  appendAdminAuditEvent,
  parseClientInfo,
} from "@/lib/adminAuditLog";
import { SITE_KEY } from "@/lib/site";
import {
  completeSiteAdminProfile,
  updateSiteAdminDisplayName,
} from "@/lib/site-access";

export async function GET() {
  const access = await getAdminAccess();
  if (!access) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (access.mode === "bootstrap") {
    return NextResponse.json({
      mode: "bootstrap",
      profileComplete: false,
      email: null,
      displayName: null,
    });
  }

  return NextResponse.json({
    mode: "neon",
    profileComplete: access.profileComplete,
    email: access.email,
    displayName: access.membership.displayName || access.name || "",
  });
}

export async function POST(req: Request) {
  const access = await getAdminAccess();
  if (!access) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = parseClientInfo(req);

  let body: {
    action?: string;
    displayName?: string;
    currentPassword?: string;
    newPassword?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const action = String(body.action || "");

  if (access.mode !== "neon") {
    return NextResponse.json(
      { error: "Neon account required for this action." },
      { status: 400 },
    );
  }

  if (action === "complete_profile" || action === "update_display_name") {
    const displayName = String(body.displayName || "").trim();
    if (displayName.length < 2) {
      return NextResponse.json(
        { error: "Enter a display name (at least 2 characters)." },
        { status: 400 },
      );
    }

    if (action === "complete_profile") {
      const link = await completeSiteAdminProfile({
        authUserId: access.authUserId,
        siteKey: SITE_KEY,
        displayName,
      });
      if (!link) {
        return NextResponse.json(
          { error: "Unable to complete profile." },
          { status: 500 },
        );
      }

      try {
        await auth.updateUser({ name: displayName });
      } catch {
        /* site display name is source of truth */
      }

      await appendAdminAuditEvent({
        event: "PROFILE_COMPLETED",
        success: true,
        client,
        siteKey: SITE_KEY,
        authUserId: access.authUserId,
      });

      return NextResponse.json({
        ok: true,
        displayName: link.displayName,
        profileComplete: true,
      });
    }

    const link = await updateSiteAdminDisplayName({
      authUserId: access.authUserId,
      siteKey: SITE_KEY,
      displayName,
    });
    if (!link) {
      return NextResponse.json(
        { error: "Unable to update display name." },
        { status: 500 },
      );
    }

    try {
      await auth.updateUser({ name: displayName });
    } catch {
      /* ignore */
    }

    return NextResponse.json({ ok: true, displayName: link.displayName });
  }

  if (action === "change_password") {
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters." },
        { status: 400 },
      );
    }

    const { error } = await auth.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Unable to change password." },
        { status: 400 },
      );
    }

    await appendAdminAuditEvent({
      event: "PASSWORD_CHANGED",
      success: true,
      client,
      siteKey: SITE_KEY,
      authUserId: access.authUserId,
    });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
