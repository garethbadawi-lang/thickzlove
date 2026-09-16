import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let sqlClient: NeonQueryFunction<false, false> | null = null;

/** Strip accidental wrapping quotes from env values pasted into Vercel. */
function normalizeDatabaseUrl(raw: string): string {
  let url = raw.trim();
  if (
    (url.startsWith('"') && url.endsWith('"')) ||
    (url.startsWith("'") && url.endsWith("'"))
  ) {
    url = url.slice(1, -1).trim();
  }
  return url;
}

export function getDatabaseUrl(): string | null {
  const raw = process.env.DATABASE_URL;
  if (!raw?.trim()) return null;
  return normalizeDatabaseUrl(raw);
}

export function getSql() {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  if (!sqlClient) {
    sqlClient = neon(url);
  }
  return sqlClient;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(getDatabaseUrl());
}
