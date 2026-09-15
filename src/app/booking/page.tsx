import type { Metadata } from "next";
import { Suspense } from "react";
import { PageIntro } from "@/components/PageIntro";
import { BookingForm } from "@/components/BookingForm";
import { siteConfig } from "@/data/site-config";

export const metadata: Metadata = {
  title: "Request a Booking",
  description:
    "Submit a booking enquiry with Love Z Thick. Submitting a request does not confirm a booking.",
};

export default function BookingPage() {
  return (
    <>
      <PageIntro
        heading="Request a Booking"
        scriptSubtitle="Tell me how you would like to spend our time."
      >
        <p>
          Complete the enquiry form below. Submitting a request does not
          automatically confirm a booking. Details, screening and availability
          must be reviewed first.
        </p>
        <p className="mt-4 text-sm">{siteConfig.companionshipDisclaimer}</p>
      </PageIntro>

      <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <Suspense fallback={<div className="card-light h-96 animate-pulse" />}>
          <BookingForm />
        </Suspense>
      </div>
    </>
  );
}
