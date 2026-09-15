export interface EtiquetteSection {
  id: string;
  title: string;
  body: string;
  displayOrder: number;
}

export const etiquetteCopy = {
  heading: "Etiquette and Expectations",
  disclaimer:
    "All arrangements are for lawful social companionship. No sexual service is offered or implied.",
} as const;

export const etiquetteSections: EtiquetteSection[] = [
  {
    id: "respect",
    title: "Respect",
    body: "Polite, respectful communication is required at every stage.",
    displayOrder: 1,
  },
  {
    id: "privacy",
    title: "Privacy",
    body: "Personal details, messages and photographs must not be shared without permission.",
    displayOrder: 2,
  },
  {
    id: "boundaries",
    title: "Boundaries",
    body: "Every arrangement remains within agreed personal, professional and legal boundaries.",
    displayOrder: 3,
  },
  {
    id: "punctuality",
    title: "Punctuality",
    body: "Clients should arrive on time and communicate promptly about unavoidable delays.",
    displayOrder: 4,
  },
  {
    id: "presentation",
    title: "Hygiene and presentation",
    body: "Cleanliness, appropriate dress and respectful conduct are expected.",
    displayOrder: 5,
  },
  {
    id: "safety",
    title: "Safety",
    body: "Requests involving illegal conduct, coercion, intoxication, weapons or unsafe environments will be declined.",
    displayOrder: 6,
  },
  {
    id: "payments",
    title: "Payments",
    body: "Only use payment instructions provided through an official confirmed channel.",
    displayOrder: 7,
  },
  {
    id: "cancellation",
    title: "Cancellation",
    body: "Cancellation terms should be reviewed before confirming an arrangement.",
    displayOrder: 8,
  },
];
