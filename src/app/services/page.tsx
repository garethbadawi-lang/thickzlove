import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { ServiceMenu } from "@/components/ServiceMenu";
import { ServiceDisclaimer } from "@/components/ServiceDisclaimer";
import { BookingCTA } from "@/components/BookingCTA";
import { servicesPageCopy } from "@/data/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Services and experiences with Love Z Thick. Starting rates shown for arranged time and experiences only.",
};

export default function ServicesPage() {
  return (
    <>
      <PageIntro
        heading={servicesPageCopy.heading}
        scriptSubtitle={servicesPageCopy.scriptSubtitle}
      >
        <p>{servicesPageCopy.intro}</p>
      </PageIntro>

      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
        <ServiceMenu />
        <div className="mt-12">
          <ServiceDisclaimer />
        </div>
      </div>

      <BookingCTA />
    </>
  );
}
