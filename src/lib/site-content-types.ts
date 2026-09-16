import type { SocialLink } from "@/data/socials";
import type { GalleryImage } from "@/data/gallery";
import type { CompanionService } from "@/data/services";
import type { FaqItem } from "@/data/faqs";

export type AvailabilityOverrideStatus = "available" | "unavailable";

export type SiteContent = {
  version: 1;
  updatedAt: string;
  homepage: {
    announcementEnabled: boolean;
    announcementText: string;
    tagline: string;
    heroHeading: string;
    heroScript: string;
    heroDescription: string;
    mainCtaLabel: string;
    mainCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    introHeading: string;
    introText: string;
  };
  about: {
    heading: string;
    scriptSubtitle: string;
    paragraphs: string[];
    personality: string;
    idealArrangements: string;
    favouriteSettings: string;
    interests: string;
    dressStyle: string;
    travelPreferences: string;
    languages: string;
    generalAvailability: string;
  };
  socials: SocialLink[];
  gallery: GalleryImage[];
  /** date (YYYY-MM-DD) → available | unavailable */
  availabilityOverrides: Record<string, AvailabilityOverrideStatus>;
  services: CompanionService[];
  faqs: FaqItem[];
  settings: {
    responseTime: string;
    contactSuccessMessage: string;
    contactPrivacyNote: string;
    location: string;
    footerMessage: string;
  };
};

export type SiteContentSection =
  | "homepage"
  | "about"
  | "socials"
  | "gallery"
  | "availabilityOverrides"
  | "services"
  | "faqs"
  | "settings";
