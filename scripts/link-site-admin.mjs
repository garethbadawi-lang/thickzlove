/**
 * Link an existing Neon Auth user (by email) to a site_key in site_admins.
 *
 * Usage:
 *   node --env-file=.env.local scripts/link-site-admin.mjs --email user@example.com --site thickzlove --role owner
 *
 * Create the Neon Auth user first (when you know her real email):
 *   neon neon-auth user create --email user@example.com --name "Love Z Thick" --branch production
 *
 * Then ask her to set a password via Neon Auth forgot-password / sign-in email flows
 * (shared Neon email provider is already enabled), or sign up once if you temporarily
 * allow self-signup for that address.
 */
import { neon } from "@neondatabase/serverless";

function arg(name, fallback = null) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  return process.argv[idx + 1] ?? fallback;
}

const email = arg("email");
const siteKey = arg("site", "thickzlove");
const role = arg("role", "owner");

if (!email) {
  console.error("Missing --email");
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const sql = neon(databaseUrl);

const users = await sql`
  SELECT id, email, name
  FROM neon_auth.user
  WHERE lower(email) = lower(${email})
  LIMIT 1
`;

if (!users.length) {
  console.error(
    `No Neon Auth user found for ${email}. Create one first:\n` +
      `  neon neon-auth user create --email ${email} --name "…" --branch production`,
  );
  process.exit(1);
}

const user = users[0];

const sites = await sql`
  SELECT id, site_key, display_name
  FROM sites
  WHERE site_key = ${siteKey}
  LIMIT 1
`;

if (!sites.length) {
  console.error(`Site not found: ${siteKey}. Run scripts/ensure-site-schema.mjs first.`);
  process.exit(1);
}

const site = sites[0];

const linked = await sql`
  INSERT INTO site_admins (site_id, auth_user_id, role)
  VALUES (${site.id}, ${String(user.id)}, ${role})
  ON CONFLICT (site_id, auth_user_id) DO UPDATE
    SET role = EXCLUDED.role
  RETURNING id, site_id, auth_user_id, role, created_at
`;

console.log("Linked:", {
  email: user.email,
  authUserId: user.id,
  siteKey: site.site_key,
  displayName: site.display_name,
  role: linked[0]?.role,
  siteAdminId: linked[0]?.id,
});
