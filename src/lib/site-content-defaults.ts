import { siteConfig } from "@/data/site-config";
import { socials } from "@/data/socials";
import { galleryImages } from "@/data/gallery";
import { services } from "@/data/services";
import { faqs } from "@/data/faqs";
import type { SiteContent } from "@/lib/site-content-types";

export function createDefaultSiteContent(): SiteContent {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    homepage: {
      announcementEnabled: siteConfig.announcement.enabled,
      announcementText: siteConfig.announcement.text,
      tagline: siteConfig.tagline,
      heroHeading: siteConfig.heroHeading,
      heroScript: siteConfig.heroScript,
      heroDescription: siteConfig.heroDescription,
      mainCtaLabel: siteConfig.mainCta.label,
      mainCtaHref: siteConfig.mainCta.href,
      secondaryCtaLabel: siteConfig.secondaryCta.label,
      secondaryCtaHref: siteConfig.secondaryCta.href,
      introHeading: "Atlanta-Based Creator",
      introText:
        "Love Z Thick is an Atlanta-based adult entertainer, video vixen, dancer and content creator. Follow her socials and explore her latest content through her official links.",
    },
    about: {
      heading: siteConfig.about.heading,
      scriptSubtitle: siteConfig.about.scriptSubtitle,
      paragraphs: [...siteConfig.about.paragraphs],
      personality: siteConfig.about.personality,
      idealArrangements: siteConfig.about.idealArrangements,
      favouriteSettings: siteConfig.about.favouriteSettings,
      interests: siteConfig.about.interests,
      dressStyle: siteConfig.about.dressStyle,
      travelPreferences: siteConfig.about.travelPreferences,
      languages: siteConfig.about.languages,
      generalAvailability: siteConfig.about.generalAvailability,
    },
    socials: socials.map((s) => ({ ...s })),
    gallery: galleryImages.map((g) => ({ ...g })),
    availabilityOverrides: {},
    services: services.map((s) => ({ ...s })),
    faqs: faqs.map((f) => ({ ...f })),
    settings: {
      responseTime: siteConfig.contact.responseTime,
      contactSuccessMessage: siteConfig.contact.successMessage,
      contactPrivacyNote: siteConfig.contact.privacyNote,
      location: siteConfig.location,
      footerMessage: siteConfig.footer.message,
    },
  };
}
