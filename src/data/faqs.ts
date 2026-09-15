export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  enabled: boolean;
  displayOrder: number;
}

export const faqs: FaqItem[] = [
  {
    id: "request",
    question: "How do I request a booking?",
    answer:
      "Visit the Booking page, complete the enquiry form and submit your preferred dates and service. You may also begin from the Availability page by selecting a date.",
    enabled: true,
    displayOrder: 1,
  },
  {
    id: "confirm",
    question: "Does submitting the form confirm my booking?",
    answer:
      "No. Submitting a request does not automatically confirm a booking. Details, screening and availability must be reviewed first.",
    enabled: true,
    displayOrder: 2,
  },
  {
    id: "ahead",
    question: "How far ahead should I enquire?",
    answer:
      "Advance notice is preferred, particularly for events and travel. Same-week requests may be considered depending on availability.",
    enabled: true,
    displayOrder: 3,
  },
  {
    id: "same-day",
    question: "Are same-day requests accepted?",
    answer:
      "Same-day requests are occasionally considered but cannot be guaranteed. Please use the enquiry form and note the urgency.",
    enabled: true,
    displayOrder: 4,
  },
  {
    id: "travel",
    question: "Are travel arrangements available?",
    answer:
      "Yes, travel companionship may be arranged subject to screening and advance planning. Flights, accommodation and travel expenses are quoted separately.",
    enabled: true,
    displayOrder: 5,
  },
  {
    id: "expenses",
    question: "Are travel expenses included?",
    answer:
      "No. Starting prices do not include flights, accommodation or other travel expenses unless expressly confirmed in writing.",
    enabled: true,
    displayOrder: 6,
  },
  {
    id: "verification",
    question: "Is identity verification required?",
    answer:
      "First-time clients may be asked to complete a secure identity and age check through a private third-party verification link. Documents are not uploaded to this website.",
    enabled: true,
    displayOrder: 7,
  },
  {
    id: "information",
    question: "How is my information handled?",
    answer:
      "Enquiry details are used only to review and respond to your request. Please see the Privacy Policy for retention and contact rights.",
    enabled: true,
    displayOrder: 8,
  },
  {
    id: "outfit",
    question: "Can I choose an outfit?",
    answer:
      "Dress preferences may be discussed during planning. Final presentation remains within Love Z Thick’s personal style and the occasion’s requirements.",
    enabled: true,
    displayOrder: 9,
  },
  {
    id: "after",
    question: "What happens after I submit an enquiry?",
    answer:
      "Your request is reviewed. You may receive a request for additional information, a verification step, or confirmation of next steps if the arrangement can proceed.",
    enabled: true,
    displayOrder: 10,
  },
  {
    id: "payment",
    question: "What payment methods are accepted?",
    answer:
      "Accepted methods are confirmed only through an official channel after approval. Do not send payment to any unlisted account.",
    enabled: true,
    displayOrder: 11,
  },
  {
    id: "cancellation",
    question: "What is the cancellation policy?",
    answer:
      "Cancellation terms are shared before confirmation. Please review them carefully prior to agreeing an arrangement.",
    enabled: true,
    displayOrder: 12,
  },
  {
    id: "accepted",
    question: "Are all requests accepted?",
    answer:
      "No. Every request is subject to approval. Love Z Thick may decline any request without providing a reason.",
    enabled: true,
    displayOrder: 13,
  },
  {
    id: "sexual",
    question: "Are the services sexual?",
    answer:
      "No. All advertised fees are for time, social companionship and the stated experience. No sexual service is offered, promised or implied.",
    enabled: true,
    displayOrder: 14,
  },
];

export function getEnabledFaqs() {
  return faqs
    .filter((f) => f.enabled)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}
