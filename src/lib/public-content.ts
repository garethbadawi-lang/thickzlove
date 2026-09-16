import { cache } from "react";
import {
  availability as sampleAvailability,
  type AvailabilityDay,
  type TimeWindow,
} from "@/data/availability";
import { readSiteContent } from "@/lib/site-content-store";
import type { SiteContent } from "@/lib/site-content-types";

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  return readSiteContent();
});

export async function getPublicSocials() {
  const content = await getSiteContent();
  return content.socials.filter((s) => s.enabled);
}

export async function getPublicGalleryImages() {
  const content = await getSiteContent();
  return content.gallery
    .filter((i) => i.enabled)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getPublicFeaturedGallery(limit = 4) {
  const images = await getPublicGalleryImages();
  return images.filter((i) => i.featured).slice(0, limit);
}

export async function getPublicServices() {
  const content = await getSiteContent();
  return content.services
    .filter((s) => s.enabled)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getPublicFeaturedServices(limit = 3) {
  const services = await getPublicServices();
  return services.filter((s) => s.featured).slice(0, limit);
}

export async function getPublicServiceById(id: string) {
  const services = await getPublicServices();
  return services.find((s) => s.id === id);
}

export async function getPublicFaqs() {
  const content = await getSiteContent();
  return content.faqs
    .filter((f) => f.enabled)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

const DEFAULT_WINDOWS: TimeWindow[] = [
  "Daytime",
  "Early evening",
  "Evening",
  "Flexible",
];

/**
 * Build public calendar from admin overrides.
 * Unmarked dates keep the built-in sample schedule so the live calendar
 * is not emptied before the client has set anything.
 */
export async function getPublicAvailability(
  daysAhead = 90,
): Promise<AvailabilityDay[]> {
  const content = await getSiteContent();
  const overrides = content.availabilityOverrides || {};
  const sampleByDate = new Map(sampleAvailability.map((d) => [d.date, d]));
  const days: AvailabilityDay[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  for (let i = 1; i <= daysAhead; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const status = overrides[iso];

    if (status === "available") {
      days.push({
        date: iso,
        status: "available",
        availableWindows: DEFAULT_WINDOWS,
        enabled: true,
      });
    } else if (status === "unavailable") {
      days.push({
        date: iso,
        status: "unavailable",
        availableWindows: [],
        enabled: true,
      });
    } else {
      const sample = sampleByDate.get(iso);
      days.push(
        sample
          ? { ...sample }
          : {
              date: iso,
              status: "unavailable",
              availableWindows: [],
              enabled: true,
            },
      );
    }
  }

  return days;
}

export async function getPublicUpcomingAvailable(limit = 5) {
  const days = await getPublicAvailability();
  return days
    .filter(
      (d) =>
        d.enabled &&
        (d.status === "available" ||
          d.status === "limited" ||
          d.status === "enquire"),
    )
    .slice(0, limit);
}
