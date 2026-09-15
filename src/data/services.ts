export type ServiceCategory = "social" | "event" | "travel" | "digital";

export interface CompanionService {
  id: string;
  name: string;
  description: string;
  duration: string;
  priceLabel: string;
  category: ServiceCategory;
  featured: boolean;
  enabled: boolean;
  displayOrder: number;
}

export const servicesPageCopy = {
  heading: "Companion Services",
  scriptSubtitle: "Choose the time and setting that suits you.",
  intro:
    "Each experience is arranged privately and tailored around the agreed setting, duration and expectations. Prices shown are starting rates and may vary depending on location, travel and timing.",
  disclaimers: [
    "All rates are for time, social companionship and the stated experience only. No sexual service is offered, promised or implied. Every arrangement is subject to approval, screening, availability and agreed boundaries.",
    "Travel expenses are quoted separately.",
    "Deposits may be required after approval.",
    "Prices may vary for late-night, extended or travel arrangements.",
    "Gifts do not reduce the agreed booking fee.",
    "No booking is confirmed until written confirmation is provided.",
    "Miss Juicy Staxxx may decline any request.",
  ],
} as const;

export const services: CompanionService[] = [
  {
    id: "oral-treatment",
    name: "Oral Treatment",
    description:
      "If you are experiencing tightness in your groin area, I can help with that by providing oral treatment and removing the build up of white fluid.",
    duration: " 30 mins",
    priceLabel: "Starting from $200",
    category: "social",
    featured: true,
    enabled: true,
    displayOrder: 1,
  },
  {
    id: "relaxing-copulation",
    name: "Relaxing Copulation",
    description:
      "If you have had a stressed day at work I have a way to defintely relieve that stress.",
    duration: "1 hour",
    priceLabel: "Starting from $650",
    category: "event",
    featured: true,
    enabled: true,
    displayOrder: 2,
  },
  {
    id: "night-cap",
    name: "Night Cap",
    description:
      "For back to back oral treatment and soothing copulation that will leave you drained at night",
    duration: "All nighter",
    priceLabel: "Starting from $1000",
    category: "social",
    featured: true,
    enabled: true,
    displayOrder: 3,
  },
  {
    id: "event-companion",
    name: "Event Companion",
    description:
      "Confident and polished company for galas, business functions, weddings, launches and private events.",
    duration: "3 hours",
    priceLabel: "Starting from $750",
    category: "event",
    featured: false,
    enabled: true,
    displayOrder: 4,
  },
  {
    id: "extended-evening",
    name: "Extended Evening",
    description:
      "An unhurried evening arrangement with additional time for dining, entertainment and conversation.",
    duration: "5 hours",
    priceLabel: "Starting from $1,100",
    category: "social",
    featured: false,
    enabled: true,
    displayOrder: 5,
  },
  {
    id: "travel-companion",
    name: "Travel Companion",
    description:
      "Discreet social companionship for an agreed domestic or international trip, subject to screening and advance planning. Flights, accommodation and expenses are not included.",
    duration: "Full day",
    priceLabel: "Starting from $1,500",
    category: "travel",
    featured: false,
    enabled: true,
    displayOrder: 6,
  },
  {
    id: "virtual-date",
    name: "Virtual Date",
    description:
      "A private online conversation arranged through an approved video platform.",
    duration: "30 minutes",
    priceLabel: "Starting from $175",
    category: "digital",
    featured: false,
    enabled: true,
    displayOrder: 7,
  },
  {
    id: "personalised-video",
    name: "Personalised Video",
    description:
      "A private recorded greeting or personalised digital video created within agreed boundaries.",
    duration: "Digital delivery",
    priceLabel: "Starting from $250",
    category: "digital",
    featured: false,
    enabled: true,
    displayOrder: 8,
  },
  {
    id: "public-appearance",
    name: "Public Appearance",
    description:
      "An elegant personal appearance for a launch, celebration, photoshoot or approved promotional event.",
    duration: "2 hours",
    priceLabel: "Starting from $700",
    category: "event",
    featured: false,
    enabled: true,
    displayOrder: 9,
  },
  {
    id: "additional-time",
    name: "Additional Time",
    description:
      "Additional agreed companionship time added to an existing arrangement.",
    duration: "Per hour",
    priceLabel: "Starting from $225",
    category: "social",
    featured: false,
    enabled: true,
    displayOrder: 10,
  },
];

export function getEnabledServices() {
  return services
    .filter((s) => s.enabled)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getFeaturedServices(limit = 3) {
  return getEnabledServices()
    .filter((s) => s.featured)
    .slice(0, limit);
}

export function getServiceById(id: string) {
  return getEnabledServices().find((s) => s.id === id);
}
