-- Multi-site CreatorSiteHub schema (shared Neon project).
-- Safe to re-run: IF NOT EXISTS + ON CONFLICT DO NOTHING.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  contact_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  auth_user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner',
  display_name TEXT,
  profile_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (site_id, auth_user_id)
);

ALTER TABLE site_admins
  ADD COLUMN IF NOT EXISTS display_name TEXT;

ALTER TABLE site_admins
  ADD COLUMN IF NOT EXISTS profile_completed_at TIMESTAMPTZ;

-- Client bootstrap (lovezthick) migration state on the site row
ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS bootstrap_migrated_at TIMESTAMPTZ;

ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS bootstrap_pending_email TEXT;

ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS bootstrap_pending_display_name TEXT;

ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS bootstrap_pending_auth_user_id TEXT;

CREATE INDEX IF NOT EXISTS site_admins_auth_user_id_idx
  ON site_admins (auth_user_id);

CREATE INDEX IF NOT EXISTS site_admins_site_id_idx
  ON site_admins (site_id);

CREATE INDEX IF NOT EXISTS sites_site_key_idx
  ON sites (site_key);

INSERT INTO sites (site_key, display_name)
VALUES ('thickzlove', 'Love Z Thick')
ON CONFLICT (site_key) DO NOTHING;
