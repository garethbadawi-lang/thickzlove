import { getSql, isDatabaseConfigured } from "@/lib/db";
import { SITE_KEY } from "@/lib/site";

export type SiteRecord = {
  id: string;
  siteKey: string;
  displayName: string;
  contactEmail: string | null;
};

export type SiteAdminLink = {
  id: string;
  siteId: string;
  authUserId: string;
  role: string;
  siteKey: string;
};

/** Ensure the Thick Z Love site row exists (idempotent). */
export async function ensureSiteRecord(
  siteKey = SITE_KEY,
  displayName = "Love Z Thick",
): Promise<SiteRecord | null> {
  if (!isDatabaseConfigured()) return null;
  const sql = getSql();
  await sql`
    INSERT INTO sites (site_key, display_name)
    VALUES (${siteKey}, ${displayName})
    ON CONFLICT (site_key) DO NOTHING
  `;
  const rows = await sql`
    SELECT id, site_key, display_name, contact_email
    FROM sites
    WHERE site_key = ${siteKey}
    LIMIT 1
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    siteKey: String(row.site_key),
    displayName: String(row.display_name),
    contactEmail: row.contact_email ? String(row.contact_email) : null,
  };
}

export async function getSiteByKey(siteKey: string): Promise<SiteRecord | null> {
  if (!isDatabaseConfigured()) return null;
  const sql = getSql();
  const rows = await sql`
    SELECT id, site_key, display_name, contact_email
    FROM sites
    WHERE site_key = ${siteKey}
    LIMIT 1
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    siteKey: String(row.site_key),
    displayName: String(row.display_name),
    contactEmail: row.contact_email ? String(row.contact_email) : null,
  };
}

export async function updateSiteContactEmail(
  siteKey: string,
  contactEmail: string | null,
): Promise<SiteRecord | null> {
  if (!isDatabaseConfigured()) return null;
  const sql = getSql();
  const normalized =
    contactEmail && contactEmail.trim() ? contactEmail.trim().toLowerCase() : null;
  const rows = await sql`
    UPDATE sites
    SET contact_email = ${normalized}, updated_at = now()
    WHERE site_key = ${siteKey}
    RETURNING id, site_key, display_name, contact_email
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    siteKey: String(row.site_key),
    displayName: String(row.display_name),
    contactEmail: row.contact_email ? String(row.contact_email) : null,
  };
}

/**
 * Server-side site authorization: Neon Auth user must be linked in site_admins
 * for the given site_key. Never trust a client-supplied site_key alone.
 */
export async function getSiteAdminLink(
  authUserId: string,
  siteKey: string,
): Promise<SiteAdminLink | null> {
  if (!isDatabaseConfigured() || !authUserId) return null;
  const sql = getSql();
  const rows = await sql`
    SELECT
      sa.id,
      sa.site_id,
      sa.auth_user_id,
      sa.role,
      s.site_key
    FROM site_admins sa
    INNER JOIN sites s ON s.id = sa.site_id
    WHERE sa.auth_user_id = ${authUserId}
      AND s.site_key = ${siteKey}
    LIMIT 1
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    siteId: String(row.site_id),
    authUserId: String(row.auth_user_id),
    role: String(row.role),
    siteKey: String(row.site_key),
  };
}

export async function isUserAuthorizedForSite(
  authUserId: string,
  siteKey: string,
): Promise<boolean> {
  const link = await getSiteAdminLink(authUserId, siteKey);
  return Boolean(link);
}
