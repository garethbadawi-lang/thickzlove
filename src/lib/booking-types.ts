export const venueTypes = [
  "Restaurant",
  "Hotel lounge",
  "Public event",
  "Private function",
  "Virtual",
  "Travel",
  "Other agreed public setting",
] as const;

export type VenueType = (typeof venueTypes)[number];

export const contactMethods = [
  "Email",
  "Mobile",
  "Either",
] as const;

export type ContactMethod = (typeof contactMethods)[number];

export type EnquiryStatus =
  | "New"
  | "Under review"
  | "Awaiting information"
  | "Screening required"
  | "Awaiting verification"
  | "Approved"
  | "Declined"
  | "Confirmed"
  | "Completed"
  | "Cancelled";

export type VerificationStatus =
  | "Not requested"
  | "Verification requested"
  | "Verification in progress"
  | "Verified"
  | "Rejected"
  | "Expired";

export type DepositStatus =
  | "Not requested"
  | "Awaiting deposit"
  | "Received"
  | "Refunded"
  | "Waived";

export interface BookingEnquiry {
  id: string;
  referenceNumber: string;
  fullName: string;
  preferredName: string;
  email: string;
  mobile: string;
  country: string;
  city: string;
  preferredContactMethod: ContactMethod | string;
  serviceId: string;
  serviceName: string;
  preferredDate: string;
  alternativeDate: string;
  preferredStartTime: string;
  requestedDuration: string;
  attendees: string;
  area: string;
  venueType: VenueType | string;
  purpose: string;
  dressPreference: string;
  eventInfo: string;
  accessibility: string;
  additionalNotes: string;
  travelRequirements: string;
  howFound: string;
  timeWindow: string;
  verificationStatus: VerificationStatus;
  enquiryStatus: EnquiryStatus;
  depositStatus: DepositStatus;
  internalNotes: string;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookingFormPayload {
  fullName: string;
  preferredName: string;
  email: string;
  mobile: string;
  country: string;
  city: string;
  preferredContactMethod: string;
  ageConfirmed: boolean;
  serviceId: string;
  preferredDate: string;
  alternativeDate: string;
  preferredStartTime: string;
  requestedDuration: string;
  attendees: string;
  area: string;
  venueType: string;
  purpose: string;
  dressPreference: string;
  eventInfo: string;
  accessibility: string;
  additionalNotes: string;
  travelRequirements: string;
  howFound: string;
  timeWindow?: string;
  understandNotConfirmed: boolean;
  understandCompanionshipOnly: boolean;
  agreeRespectful: boolean;
  agreeTerms: boolean;
  website?: string;
}
