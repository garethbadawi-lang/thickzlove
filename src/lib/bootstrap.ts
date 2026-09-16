/** One-time client starter username (legacy bootstrap only). */
export const BOOTSTRAP_USERNAME = "lovezthick";

export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
