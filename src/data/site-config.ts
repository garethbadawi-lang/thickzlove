/**
 * Central site configuration for Miss Juicy Staxxx.
 */

export const siteConfig = {
  name: "Miss Juicy Staxxx",
  shortName: "Miss Juicy",
  username: "@missjuicystaxxx",
  handle: "missjuicystaxxx",
  monogram: "MJS",
  tagline: "Independent Luxury Companion",
  heroHeading: "Time Beautifully Spent",
  heroScript: "A little time away from the ordinary.",
  heroDescription:
    "Elegant companionship for dinners, events, travel and memorable moments. Miss Juicy Staxxx offers a warm, discreet and thoughtfully arranged experience for respectful adults.",
  description:
    "Independent luxury companion offering lawful social companionship and carefully arranged digital experiences.",
  companionshipDisclaimer:
    "All rates are for time, social companionship and the stated experience only. No sexual service is offered, promised or implied. Every arrangement is subject to approval, screening, availability and agreed boundaries.",
  about: {
    heading: "Meet Miss Juicy Staxxx",
    scriptSubtitle: "Confident, composed and unforgettable.",
    paragraphs: [
      "Miss Juicy Staxxx is an independent luxury companion known for her warm presence, polished style and ability to make every occasion feel effortless. She enjoys thoughtful conversation, elegant surroundings and meeting respectful adults who value privacy and good company.",
      "Whether accompanying you to dinner, an event or a planned journey, each arrangement is approached with care, discretion and attention to detail.",
    ],
    personality: "Warm, composed, engaging and selective.",
    idealArrangements:
      "Dinners, events, travel companionship and thoughtfully planned social occasions.",
    favouriteSettings:
      "Fine dining, hotel lounges, cultural events, private celebrations and elegant city evenings.",
    interests: "Conversation, travel, fashion, music and memorable atmospheres.",
    dressStyle: "Polished evening wear, tailored day looks and occasion-appropriate elegance.",
    travelPreferences: "Advance planning, respectful itineraries and comfortable public settings.",
    languages: "English",
    generalAvailability: "By enquiry — see the Availability page for indicative dates.",
  },
  profileImage: "/images/portrait-placeholder.svg",
  heroImage: "/images/portrait-placeholder.svg",
  ogImage: "/images/og-share.svg",
  ageGate: {
    enabled: true,
    eyebrow: "ADULTS ONLY",
    title: "Miss Juicy Staxxx",
    message:
      "This website is intended for adults. Please confirm that you meet the minimum legal age required in your location before continuing.",
    disclaimer:
      "Arrangements are for lawful social companionship only. No sexual service is offered or implied.",
    confirmLabel: "Enter",
    exitLabel: "Exit",
    exitUrl: "https://www.google.com",
    storageKey: "missjuicystaxxx-age-confirmed",
  },
  announcement: {
    enabled: false,
    text: "",
  },
  mainCta: {
    label: "Request a Booking",
    href: "/booking",
  },
  secondaryCta: {
    label: "Explore My Services",
    href: "/services",
  },
  contact: {
    formEnabled: true,
    successMessage:
      "Your enquiry has been received. A response will follow once it has been reviewed.",
    rateLimitMessage:
      "Too many requests. Please wait a moment before trying again.",
    privacyNote: "Your enquiry will not be displayed publicly.",
    responseTime: "Enquiries are typically reviewed within 24–48 hours.",
  },
  verification: {
    heading: "Identity Verification",
    copy: "To protect both parties, first-time clients may be asked to complete a secure identity and age check. Verification should be completed through the private verification link provided after the enquiry is reviewed.",
    buttonLabel: "Begin Secure Verification",
    note: "This website does not accept or store identity documents directly. A secure third-party provider should be used.",
  },
  analytics: {
    enabled: false,
    provider: null as string | null,
  },
  seo: {
    noindex: false,
    title: "Miss Juicy Staxxx | Independent Luxury Companion",
    description:
      "Elegant companionship for dinners, events, travel and memorable moments. Lawful social arrangements with Miss Juicy Staxxx.",
    ogTitle: "Miss Juicy Staxxx",
    ogDescription:
      "Independent luxury companion — elegant, discreet and thoughtfully arranged.",
    siteUrl: "https://missjuicystaxxx.com",
    locale: "en_US",
  },
  footer: {
    message: "Independent luxury companion for respectful adults.",
    copyright: `© ${new Date().getFullYear()} Miss Juicy Staxxx. All rights reserved.`,
    trademark:
      "All third-party platform names belong to their respective owners.",
  },
} as const;

export type SiteConfig = typeof siteConfig;
