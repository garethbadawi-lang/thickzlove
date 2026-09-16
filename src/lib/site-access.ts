import { getSql, isDatabaseConfigured } from "@/lib/db";
import { SITE_KEY } from "@/lib/site";

export type SiteRecord = {
  id: string;
  siteKey: string;
  displayName: string;
  contactEmail: string | null;
  bootstrapMigratedAt: string | null;
  bootstrapPendingEmail: string | null;
  bootstrapPendingDisplayName: string | null;
  bootstrapPendingAuthUserId: string | null;
};

export type SiteAdminLink = {
  id: string;
  siteId: string;
  authUserId: string;
  role: string;
  siteKey: string;
  displayName: string | null;
  profileCompletedAt: string | null;
};

function mapSite(row: Record<string, unknown>): SiteRecord {
  return {
    id: String(row.id),
    siteKey: String(row.site_key),
    displayName: String(row.display_name),
    contactEmail: row.contact_email ? String(row.contact_email) : null,
    bootstrapMigratedAt: row.bootstrap_migrated_at
      ? String(row.bootstrap_migrated_at)
      : null,
    bootstrapPendingEmail: row.bootstrap_pending_email
      ? String(row.bootstrap_pending_email)
      : null,
    bootstrapPendingDisplayName: row.bootstrap_pending_display_name
      ? String(row.bootstrap_pending_display_name)
      : null,
    bootstrapPendingAuthUserId: row.bootstrap_pending_auth_user_id
      ? String(row.bootstrap_pending_auth_user_id)
      : null,
  };
}

function mapSiteAdmin(row: Record<string, unknown>): SiteAdminLink {
  return {
    id: String(row.id),
    siteId: String(row.site_id),
    authUserId: String(row.auth_user_id),
    role: String(row.role),
    siteKey: String(row.site_key),
    displayName: row.display_name ? String(row.display_name) : null,
    profileCompletedAt: row.profile_completed_at
      ? String(row.profile_completed_at)
      : null,
  };
}

const SITE_SELECT = `
  id, site_key, display_name, contact_email,
  bootstrap_migrated_at, bootstrap_pending_email,
  bootstrap_pending_display_name, bootstrap_pending_auth_user_id
`;

/** Ensure the Thick Z Love site row exists (idempotent). */
export async function ensureSiteRecord(
  siteKey: string = SITE_KEY,
  displayName = "Love Z Thick",
): Promise<SiteRecord | null> {
  if (!isDatabaseConfigured()) return null;
  const sql = getSql();
  await sql`
    INSERT INTO sites (site_key, display_name)
    VALUES (${siteKey}, ${displayName})
    ON CONFLICT (site_key) DO NOTHING
  `;
  return getSiteByKey(siteKey);
}

export async function getSiteByKey(siteKey: string): Promise<SiteRecord | null> {
  if (!isDatabaseConfigured()) return null;
  const sql = getSql();
  const rows = await sql`
    SELECT
      id, site_key, display_name, contact_email,
      bootstrap_migrated_at, bootstrap_pending_email,
      bootstrap_pending_display_name, bootstrap_pending_auth_user_id
    FROM sites
    WHERE site_key = ${siteKey}
    LIMIT 1
  `;
  const row = rows[0];
  if (!row) return null;
  return mapSite(row as Record<string, unknown>);
}

export async function isBootstrapMigrated(siteKey = SITE_KEY): Promise<boolean> {
  const site = await getSiteByKey(siteKey);
  return Boolean(site?.bootstrapMigratedAt);
}

export async function setBootstrapPending(input: {
  siteKey?: string;
  email: string;
  displayName: string;
  authUserId: string;
}): Promise<SiteRecord | null> {
  if (!isDatabaseConfigured()) return null;
  const siteKey = input.siteKey || SITE_KEY;
  const sql = getSql();
  const rows = await sql`
    UPDATE sites
    SET
      bootstrap_pending_email = ${input.email.trim().toLowerCase()},
      bootstrap_pending_display_name = ${input.displayName.trim()},
      bootstrap_pending_auth_user_id = ${input.authUserId},
      updated_at = now()
    WHERE site_key = ${siteKey}
      AND bootstrap_migrated_at IS NULL
    RETURNING
      id, site_key, display_name, contact_email,
      bootstrap_migrated_at, bootstrap_pending_email,
      bootstrap_pending_display_name, bootstrap_pending_auth_user_id
  `;
  const row = rows[0];
  if (!row) return null;
  return mapSite(row as Record<string, unknown>);
}

export async function markBootstrapMigrated(input: {
  siteKey?: string;
  authUserId: string;
}): Promise<SiteRecord | null> {
  if (!isDatabaseConfigured()) return null;
  const siteKey = input.siteKey || SITE_KEY;
  const sql = getSql();
  const rows = await sql`
    UPDATE sites
    SET
      bootstrap_migrated_at = COALESCE(bootstrap_migrated_at, now()),
      updated_at = now()
    WHERE site_key = ${siteKey}
      AND bootstrap_migrated_at IS NULL
      AND bootstrap_pending_auth_user_id = ${input.authUserId}
    RETURNING
      id, site_key, display_name, contact_email,
      bootstrap_migrated_at, bootstrap_pending_email,
      bootstrap_pending_display_name, bootstrap_pending_auth_user_id
  `;
  const row = rows[0];
  if (!row) return null;
  return mapSite(row as Record<string, unknown>);
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
    RETURNING
      id, site_key, display_name, contact_email,
      bootstrap_migrated_at, bootstrap_pending_email,
      bootstrap_pending_display_name, bootstrap_pending_auth_user_id
  `;
  const row = rows[0];
  if (!row) return null;
  return mapSite(row as Record<string, unknown>);
}

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
      sa.display_name,
      sa.profile_completed_at,
      s.site_key
    FROM site_admins sa
    INNER JOIN sites s ON s.id = sa.site_id
    WHERE sa.auth_user_id = ${authUserId}
      AND s.site_key = ${siteKey}
    LIMIT 1
  `;
  const row = rows[0];
  if (!row) return null;
  return mapSiteAdmin(row as Record<string, unknown>);
}

export async function isUserAuthorizedForSite(
  authUserId: string,
  siteKey: string,
): Promise<boolean> {
  const link = await getSiteAdminLink(authUserId, siteKey);
  return Boolean(link);
}

export async function linkSiteAdmin(input: {
  authUserId: string;
  siteKey: string;
  role?: string;
  displayName?: string | null;
}): Promise<SiteAdminLink | null> {
  if (!isDatabaseConfigured()) return null;
  const site = await ensureSiteRecord(input.siteKey);
  if (!site) return null;
  const sql = getSql();
  const role = input.role || "owner";
  const displayName = input.displayName?.trim() || null;

  await sql`
    INSERT INTO site_admins (site_id, auth_user_id, role, display_name)
    VALUES (${site.id}, ${input.authUserId}, ${role}, ${displayName})
    ON CONFLICT (site_id, auth_user_id) DO UPDATE
      SET role = EXCLUDED.role,
          display_name = COALESCE(EXCLUDED.display_name, site_admins.display_name)
  `;

  return getSiteAdminLink(input.authUserId, input.siteKey);
}

export async function completeSiteAdminProfile(input: {
  authUserId: string;
  siteKey: string;
  displayName: string;
}): Promise<SiteAdminLink | null> {
  if (!isDatabaseConfigured()) return null;
  const sql = getSql();
  const name = input.displayName.trim();
  if (!name) return null;

  const rows = await sql`
    UPDATE site_admins sa
    SET
      display_name = ${name},
      profile_completed_at = COALESCE(sa.profile_completed_at, now())
    FROM sites s
    WHERE sa.site_id = s.id
      AND sa.auth_user_id = ${input.authUserId}
      AND s.site_key = ${input.siteKey}
    RETURNING
      sa.id,
      sa.site_id,
      sa.auth_user_id,
      sa.role,
      sa.display_name,
      sa.profile_completed_at,
      s.site_key
  `;
  const row = rows[0];
  if (!row) return null;
  return mapSiteAdmin(row as Record<string, unknown>);
}

export async function updateSiteAdminDisplayName(input: {
  authUserId: string;
  siteKey: string;
  displayName: string;
}): Promise<SiteAdminLink | null> {
  if (!isDatabaseConfigured()) return null;
  const sql = getSql();
  const name = input.displayName.trim();
  if (!name) return null;

  const rows = await sql`
    UPDATE site_admins sa
    SET display_name = ${name}
    FROM sites s
    WHERE sa.site_id = s.id
      AND sa.auth_user_id = ${input.authUserId}
      AND s.site_key = ${input.siteKey}
    RETURNING
      sa.id,
      sa.site_id,
      sa.auth_user_id,
      sa.role,
      sa.display_name,
      sa.profile_completed_at,
      s.site_key
  `;
  const row = rows[0];
  if (!row) return null;
  return mapSiteAdmin(row as Record<string, unknown>);
}

export function isProfileComplete(link: SiteAdminLink | null | undefined): boolean {
  return Boolean(link?.profileCompletedAt);
}

// silence unused in case SITE_SELECT kept for docs
void SITE_SELECT;
