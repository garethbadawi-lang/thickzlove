import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { SITE_KEY } from "@/lib/site";
import {
  ensureSiteRecord,
  getSiteByKey,
  updateSiteContactEmail,
} from "@/lib/site-access";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const site =
    (await getSiteByKey(SITE_KEY)) ||
    (await ensureSiteRecord(SITE_KEY, "Love Z Thick"));

  if (!site) {
    return NextResponse.json(
      { error: "Site record unavailable." },
      { status: 503 },
    );
  }

  return NextResponse.json({
    siteKey: site.siteKey,
    displayName: site.displayName,
    contactEmail: site.contactEmail,
  });
}

export async function PATCH(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { contactEmail?: string | null };
  try {
    body = (await req.json()) as { contactEmail?: string | null };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const contactEmail =
    body.contactEmail === undefined
      ? undefined
      : body.contactEmail === null || body.contactEmail === ""
        ? null
        : String(body.contactEmail).trim();

  if (contactEmail === undefined) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  if (contactEmail !== null && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return NextResponse.json(
      { error: "Enter a valid business email, or leave blank." },
      { status: 400 },
    );
  }

  await ensureSiteRecord(SITE_KEY, "Love Z Thick");
  const site = await updateSiteContactEmail(SITE_KEY, contactEmail);
  if (!site) {
    return NextResponse.json(
      { error: "Unable to update site record." },
      { status: 503 },
    );
  }

  return NextResponse.json({
    siteKey: site.siteKey,
    displayName: site.displayName,
    contactEmail: site.contactEmail,
  });
}
