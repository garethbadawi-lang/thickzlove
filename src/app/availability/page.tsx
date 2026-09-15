import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { availabilityCopy } from "@/data/availability";

export const metadata: Metadata = {
  title: "Availability",
  description:
    "View indicative availability and continue to a booking enquiry with Love Z Thick.",
};

export default function AvailabilityPage() {
  return (
    <>
      <PageIntro
        heading={availabilityCopy.heading}
        scriptSubtitle={availabilityCopy.scriptSubtitle}
      >
        <p>{availabilityCopy.notice}</p>
      </PageIntro>

      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <AvailabilityCalendar />
      </div>
    </>
  );
}
