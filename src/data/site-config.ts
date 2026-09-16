/**
 * Central site configuration for Love Z Thick.
 */

export const siteConfig = {
  name: "Love Z Thick",
  shortName: "Love Z Thick",
  username: "@ZLOVE_theGOAT",
  handle: "ZLOVE_theGOAT",
  monogram: "LZT",
  location: "Atlanta, GA",
  tagline: "Adult Entertainer • Video Vixen • Dancer • Content Creator",
  heroHeading: "18+ Only",
  heroScript: "Love Z Thick ❤️ ✨ 🍫",
  heroDescription:
    "Atlanta-based adult entertainer, video vixen, dancer and content creator. Explore her official socials and latest content.",
  description:
    "Official website for Love Z Thick — Atlanta-based adult entertainer, video vixen, dancer and content creator.",
  companionshipDisclaimer:
    "This website is for adults only (18+). Official content and contact channels are listed on this site. Do not send payments or personal documents to unofficial accounts.",
  about: {
    heading: "Meet Love Z Thick",
    scriptSubtitle: "Atlanta, GA",
    paragraphs: [
      "Love Z Thick is an Atlanta-based adult entertainer, video vixen, dancer and content creator. Follow her socials and explore her latest content through her official links.",
    ],
    personality: "Adult entertainer, video vixen, dancer and content creator.",
    idealArrangements:
      "Official content, social updates and fan connections through her verified links.",
    favouriteSettings: "Atlanta, GA",
    interests: "Entertainment, dance, video and content creation.",
    dressStyle: "As featured in her public content and appearances.",
    travelPreferences: "Based in Atlanta, GA.",
    languages: "Public communications in English.",
    generalAvailability: "Updates and content shared through her official links.",
  },
  profileImage: "/images/love-z-thick-about.png",
  heroImage: "/images/love-z-thick-hero.png",
  ogImage: "/images/love-z-thick-og.svg",
  ageGate: {
    enabled: true,
    eyebrow: "18+ ONLY",
    title: "Love Z Thick",
    message:
      "This website is intended for adults. Please confirm that you meet the minimum legal age required in your location before continuing.",
    disclaimer:
      "Adult content and entertainment. Official links only — 18+ ONLY.",
    confirmLabel: "Enter",
    exitLabel: "Exit",
    exitUrl: "https://www.google.com",
    storageKey: "lovezthick-age-confirmed",
  },
  announcement: {
    enabled: false,
    text: "",
  },
  mainCta: {
    label: "Exclusive Content",
    href: "https://onlyfans.com/Thickzlove912",
  },
  secondaryCta: {
    label: "Follow on X",
    href: "https://x.com/ZLOVE_theGOAT",
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
    title: "Love Z Thick | Official Website",
    description:
      "Official website for Love Z Thick — Atlanta-based adult entertainer, video vixen, dancer and content creator. Explore her official socials and content.",
    ogTitle: "Love Z Thick | Official Website",
    ogDescription:
      "Atlanta-based adult entertainer, video vixen, dancer and content creator. Explore her official socials and content.",
    siteUrl: "https://thickzlove.com",
    locale: "en_US",
  },
  footer: {
    message: "Atlanta-based adult entertainer, video vixen, dancer and content creator. 18+ Only.",
    copyright: `© ${new Date().getFullYear()} Love Z Thick. All rights reserved.`,
    trademark:
      "All third-party platform names belong to their respective owners.",
  },
} as const;

export type SiteConfig = typeof siteConfig;
