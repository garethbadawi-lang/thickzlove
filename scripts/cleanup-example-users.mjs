/**
 * Delete automated @example.com Neon Auth users and their site_admins rows.
 * Keeps garethbadawi@gmail.com and the thickzlove site.
 */
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const KEEP = "garethbadawi@gmail.com";

const victims = await sql`
  SELECT id::text AS id, email
  FROM neon_auth.user
  WHERE email ILIKE '%@example.com'
`;

console.log("Deleting users:", victims.map((v) => v.email));

for (const v of victims) {
  await sql`DELETE FROM site_admins WHERE auth_user_id = ${v.id}`;
  // Neon Auth related rows (best-effort by user id)
  await sql`DELETE FROM neon_auth.session WHERE "userId" = ${v.id}::uuid`.catch(() => null);
  await sql`DELETE FROM neon_auth.account WHERE "userId" = ${v.id}::uuid`.catch(() => null);
  await sql`DELETE FROM neon_auth.member WHERE "userId" = ${v.id}::uuid`.catch(() => null);
  await sql`DELETE FROM neon_auth.invitation WHERE "inviterId" = ${v.id}::uuid`.catch(() => null);
  await sql`DELETE FROM neon_auth.user WHERE id = ${v.id}::uuid`;
  console.log("deleted", v.email);
}

// Ensure gareth remains linked + profile usable for testing
const gareth = await sql`
  SELECT id::text AS id FROM neon_auth.user WHERE lower(email) = lower(${KEEP}) LIMIT 1
`;
if (!gareth[0]) {
  throw new Error("garethbadawi@gmail.com missing after cleanup");
}

const site = await sql`SELECT id::text AS id FROM sites WHERE site_key = 'thickzlove' LIMIT 1`;
if (!site[0]) throw new Error("thickzlove site missing");

await sql`
  INSERT INTO site_admins (site_id, auth_user_id, role, display_name, profile_completed_at)
  VALUES (${site[0].id}, ${gareth[0].id}, 'owner', 'Gareth', now())
  ON CONFLICT (site_id, auth_user_id) DO UPDATE
    SET display_name = COALESCE(site_admins.display_name, EXCLUDED.display_name),
        profile_completed_at = COALESCE(site_admins.profile_completed_at, EXCLUDED.profile_completed_at)
`;

const remainingUsers = await sql`SELECT email FROM neon_auth.user ORDER BY email`;
const remainingLinks = await sql`
  SELECT u.email, s.site_key, sa.profile_completed_at IS NOT NULL AS complete
  FROM site_admins sa
  JOIN sites s ON s.id = sa.site_id
  JOIN neon_auth.user u ON u.id::text = sa.auth_user_id
  ORDER BY 1
`;
const sites = await sql`SELECT site_key FROM sites`;

console.log("\nAFTER users", remainingUsers.length, remainingUsers.map((u) => u.email));
console.log("AFTER links", remainingLinks);
console.log("AFTER sites", sites.map((s) => s.site_key));
