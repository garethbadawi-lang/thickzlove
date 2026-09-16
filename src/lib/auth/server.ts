import { createNeonAuth } from "@neondatabase/auth/next/server";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

export function isNeonAuthConfigured(): boolean {
  return Boolean(
    process.env.NEON_AUTH_BASE_URL?.trim() &&
      process.env.NEON_AUTH_COOKIE_SECRET?.trim(),
  );
}

/**
 * Neon Managed Better Auth (server). Single instance for handlers, sessions,
 * and email/password sign-in. Do not import this into client components.
 */
export const auth = createNeonAuth({
  baseUrl: requireEnv("NEON_AUTH_BASE_URL"),
  cookies: {
    secret: requireEnv("NEON_AUTH_COOKIE_SECRET"),
  },
});
