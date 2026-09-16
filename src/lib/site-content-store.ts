import { promises as fs } from "fs";
import path from "path";
import { unstable_noStore as noStore } from "next/cache";
import { get, put } from "@vercel/blob";
import { createDefaultSiteContent } from "@/lib/site-content-defaults";
import {
  normalizeSocialLinks,
  repairMojibakeText,
} from "@/lib/social-links";
import type { SiteContent, SiteContentSection } from "@/lib/site-content-types";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "site-content.json");
const BLOB_PATHNAME = "data/site-content.json";

function isBlobStorageEnabled() {
  return (
    process.env.VERCEL === "1" &&
    Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)
  );
}

/** Repair UTF-8 mojibake; fall back when the string is beyond recovery. */
function healText(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  if (!value) return value;
  if (!/[ÃÂ]/.test(value) && !value.includes("\uFFFD")) return value;
  const repaired = repairMojibakeText(value).normalize("NFC");
  if (/[ÃÂ]/.test(repaired) || repaired.includes("\uFFFD")) return fallback;
  return repaired;
}

function healStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value) || value.length === 0) return fallback;
  return value.map((item, i) =>
    healText(item, fallback[i] ?? fallback[0] ?? ""),
  );
}

function mergeWithDefaults(partial: Partial<SiteContent> | null): SiteContent {
  const defaults = createDefaultSiteContent();
  if (!partial || typeof partial !== "object") return defaults;

  const homepageIn = (partial.homepage || {}) as Partial<SiteContent["homepage"]>;
  const aboutIn = (partial.about || {}) as Partial<SiteContent["about"]>;
  const settingsIn = (partial.settings || {}) as Partial<SiteContent["settings"]>;

  return {
    version: 1,
    updatedAt: partial.updatedAt || defaults.updatedAt,
    homepage: {
      ...defaults.homepage,
      ...homepageIn,
      announcementText: healText(
        homepageIn.announcementText,
        defaults.homepage.announcementText,
      ),
      tagline: healText(homepageIn.tagline, defaults.homepage.tagline),
      heroHeading: healText(
        homepageIn.heroHeading,
        defaults.homepage.heroHeading,
      ),
      heroScript: healText(
        homepageIn.heroScript,
        defaults.homepage.heroScript,
      ),
      heroDescription: healText(
        homepageIn.heroDescription,
        defaults.homepage.heroDescription,
      ),
      mainCtaLabel: healText(
        homepageIn.mainCtaLabel,
        defaults.homepage.mainCtaLabel,
      ),
      secondaryCtaLabel: healText(
        homepageIn.secondaryCtaLabel,
        defaults.homepage.secondaryCtaLabel,
      ),
      introHeading: healText(
        homepageIn.introHeading,
        defaults.homepage.introHeading,
      ),
      introText: healText(homepageIn.introText, defaults.homepage.introText),
    },
    about: {
      ...defaults.about,
      ...aboutIn,
      heading: healText(aboutIn.heading, defaults.about.heading),
      scriptSubtitle: healText(
        aboutIn.scriptSubtitle,
        defaults.about.scriptSubtitle,
      ),
      paragraphs: healStringArray(
        aboutIn.paragraphs,
        defaults.about.paragraphs,
      ),
      personality: healText(aboutIn.personality, defaults.about.personality),
      idealArrangements: healText(
        aboutIn.idealArrangements,
        defaults.about.idealArrangements,
      ),
      favouriteSettings: healText(
        aboutIn.favouriteSettings,
        defaults.about.favouriteSettings,
      ),
      interests: healText(aboutIn.interests, defaults.about.interests),
      dressStyle: healText(aboutIn.dressStyle, defaults.about.dressStyle),
      travelPreferences: healText(
        aboutIn.travelPreferences,
        defaults.about.travelPreferences,
      ),
      languages: healText(aboutIn.languages, defaults.about.languages),
      generalAvailability: healText(
        aboutIn.generalAvailability,
        defaults.about.generalAvailability,
      ),
    },
    socials: Array.isArray(partial.socials)
      ? normalizeSocialLinks(partial.socials)
      : defaults.socials,
    gallery: Array.isArray(partial.gallery) ? partial.gallery : defaults.gallery,
    availabilityOverrides:
      partial.availabilityOverrides &&
      typeof partial.availabilityOverrides === "object"
        ? partial.availabilityOverrides
        : defaults.availabilityOverrides,
    services: Array.isArray(partial.services)
      ? partial.services.map((s, i) => ({
          ...s,
          name: healText(s.name, defaults.services[i]?.name || s.name),
          description: healText(
            s.description,
            defaults.services[i]?.description || s.description,
          ),
          priceLabel: healText(
            s.priceLabel,
            defaults.services[i]?.priceLabel || s.priceLabel,
          ),
        }))
      : defaults.services,
    faqs: Array.isArray(partial.faqs)
      ? partial.faqs.map((f, i) => ({
          ...f,
          question: healText(
            f.question,
            defaults.faqs[i]?.question || f.question,
          ),
          answer: healText(f.answer, defaults.faqs[i]?.answer || f.answer),
        }))
      : defaults.faqs,
    settings: {
      ...defaults.settings,
      ...settingsIn,
      responseTime: healText(
        settingsIn.responseTime,
        defaults.settings.responseTime,
      ),
      contactSuccessMessage: healText(
        settingsIn.contactSuccessMessage,
        defaults.settings.contactSuccessMessage,
      ),
      contactPrivacyNote: healText(
        settingsIn.contactPrivacyNote,
        defaults.settings.contactPrivacyNote,
      ),
      location: healText(settingsIn.location, defaults.settings.location),
      footerMessage: healText(
        settingsIn.footerMessage,
        defaults.settings.footerMessage,
      ),
    },
  };
}

async function loadPartial(): Promise<Partial<SiteContent> | null> {
  if (isBlobStorageEnabled()) {
    const result = await get(BLOB_PATHNAME, {
      access: "private",
      useCache: false,
    });
    if (!result?.stream) return null;
    const raw = await new Response(result.stream).text();
    if (!raw.trim()) return null;
    try {
      return JSON.parse(raw) as Partial<SiteContent>;
    } catch {
      throw new Error("Site content blob contains invalid JSON.");
    }
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as Partial<SiteContent>;
  } catch {
    return null;
  }
}

async function writeRaw(content: SiteContent) {
  const normalised: SiteContent = {
    ...content,
    socials: normalizeSocialLinks(content.socials || []),
  };
  const payload = JSON.stringify(normalised, null, 2);
  if (isBlobStorageEnabled()) {
    await put(BLOB_PATHNAME, payload, {
      access: "private",
      contentType: "application/json; charset=utf-8",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 0,
    });
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, payload, "utf8");
}

export async function readSiteContent(): Promise<SiteContent> {
  noStore();
  const partial = await loadPartial();
  const content = mergeWithDefaults(partial);

  const rawSnapshot = partial ? JSON.stringify(partial) : "";
  const needsHeal =
    Boolean(partial) &&
    (/[ÃÂ]/.test(rawSnapshot) ||
      (Array.isArray(partial?.socials) &&
        partial.socials.some((raw, i) => {
          const fixed = content.socials[i];
          return !fixed || String(raw.label ?? "") !== fixed.label;
        })));

  if (needsHeal) {
    try {
      await writeRaw(content);
    } catch {
      // In-memory normalisation still applies.
    }
  }

  return content;
}

export async function writeSiteContent(
  content: SiteContent,
): Promise<SiteContent> {
  const next: SiteContent = {
    ...mergeWithDefaults(content),
    version: 1,
    updatedAt: new Date().toISOString(),
  };
  await writeRaw(next);
  return next;
}

export async function patchSiteContentSection<K extends SiteContentSection>(
  section: K,
  value: SiteContent[K],
): Promise<SiteContent> {
  const current = await readSiteContent();
  const next = {
    ...current,
    [section]: value,
    updatedAt: new Date().toISOString(),
  } as SiteContent;
  await writeRaw(next);
  return next;
}
