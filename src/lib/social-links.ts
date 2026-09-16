import type { SocialLink } from "@/data/socials";

export type SocialPlatformOption = {
  id: string;
  label: string;
  /** Filename under /public/brand-icons without .svg */
  icon: string;
};

/** Platform choices for the admin socials editor. */
export const SOCIAL_PLATFORM_OPTIONS: SocialPlatformOption[] = [
  { id: "onlyfans", label: "OnlyFans", icon: "onlyfans" },
  { id: "x", label: "X / Twitter", icon: "x" },
  { id: "telegram", label: "Telegram", icon: "telegram" },
  { id: "cashapp", label: "Cash App", icon: "cashapp" },
  { id: "venmo", label: "Venmo", icon: "venmo-v" },
  { id: "xvideos", label: "XVideos", icon: "xvideos-x" },
  { id: "pornhub", label: "Pornhub", icon: "pornhub-ph" },
  { id: "instagram", label: "Instagram", icon: "instagram" },
  { id: "tiktok", label: "TikTok", icon: "tiktok" },
  { id: "youtube", label: "YouTube", icon: "youtube" },
  { id: "website", label: "Website", icon: "link" },
  { id: "custom", label: "Custom", icon: "link" },
];

const KNOWN_ICONS = new Set(SOCIAL_PLATFORM_OPTIONS.map((p) => p.icon));

/** Icons rendered in native colour (not CSS mask). */
export const NATIVE_COLOR_SOCIAL_ICONS = new Set([
  "xvideos-x",
  "pornhub-ph",
]);

export function resolveSocialIcon(icon: string): string {
  if (KNOWN_ICONS.has(icon)) return icon;
  // Legacy / unknown → safe generic external-link glyph
  return "link";
}

export function isValidSocialUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Repair labels that were corrupted by Latin-1/UTF-8 mojibake
 * (e.g. "PHUB ÃƒÂ¢Ã‚ÂÃ‚Â¤…" instead of "PHUB ❤️").
 */
export function repairMojibakeText(input: string): string {
  if (!input || !/[ÃÂâ]|â€/.test(input)) return input;

  let current = input;
  for (let i = 0; i < 5; i += 1) {
    let next: string;
    try {
      next = Buffer.from(current, "latin1").toString("utf8");
    } catch {
      break;
    }
    if (next === current || next.includes("\uFFFD")) break;
    current = next;
    if (!/[ÃÂ]/.test(current)) break;
  }
  return current;
}

const HEART = "\u2764\uFE0F"; // ❤️

export function normalizeSocialLabel(link: Pick<SocialLink, "id" | "label">): string {
  const raw = String(link.label ?? "");
  let label = repairMojibakeText(raw).normalize("NFC").trim();

  const isPhub =
    link.id === "pornhub" ||
    /^phub\b/i.test(raw.trim()) ||
    /^phub\b/i.test(label);

  if (isPhub) {
    // Corrupted or empty → restore the intended public label.
    if (!label || /[ÃÂ]/.test(raw) || /[ÃÂ]/.test(label) || /\uFFFD/.test(label)) {
      return `PHUB ${HEART}`;
    }
    if (/^PHUB(\s*(?:\u2764\uFE0F|\u2764\uFE0E|\u2764))?$/iu.test(label)) {
      return `PHUB ${HEART}`;
    }
    // "PHUB" plus leftover junk from broken emoji bytes
    if (/^PHUB\b/i.test(label) && /[^\w\s\u2764\uFE0F\uFE0E]/u.test(label.replace(/^PHUB\s*/i, ""))) {
      const rest = label.replace(/^PHUB\s*/i, "");
      if (!/^[\u2764\uFE0F\uFE0E\s]*$/u.test(rest)) {
        return `PHUB ${HEART}`;
      }
    }
  }

  if (/[ÃÂ]/.test(label)) {
    label = repairMojibakeText(label).normalize("NFC").trim();
  }

  return label || raw;
}

export function normalizeSocialLink(link: SocialLink): SocialLink {
  return {
    ...link,
    label: normalizeSocialLabel(link),
    url: String(link.url || "").trim(),
    icon: resolveSocialIcon(link.icon || "link"),
    enabled: Boolean(link.enabled),
  };
}

export function normalizeSocialLinks(links: SocialLink[]): SocialLink[] {
  return links.map(normalizeSocialLink);
}

export function createEmptySocialLink(): SocialLink {
  return {
    id: `social-${crypto.randomUUID()}`,
    label: "",
    url: "https://",
    icon: "link",
    enabled: true,
  };
}

export function validateSocialLinks(links: SocialLink[]): string | null {
  if (!Array.isArray(links)) {
    return "Invalid social links.";
  }
  for (const link of links) {
    if (!String(link.label || "").trim()) {
      return "Each social link needs a display label.";
    }
    if (!isValidSocialUrl(link.url)) {
      return `Invalid URL for “${link.label.trim()}”. Use a full http:// or https:// link.`;
    }
  }
  return null;
}
