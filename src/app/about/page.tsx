import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { AboutIntroduction } from "@/components/AboutIntroduction";
import { BookingCTA } from "@/components/BookingCTA";
import { siteConfig } from "@/data/site-config";

export const metadata: Metadata = {
  title: "About",
  description: siteConfig.about.paragraphs[0],
};

export default function AboutPage() {
  return (
    <>
      <PageIntro
        heading={siteConfig.about.heading}
        scriptSubtitle={siteConfig.about.scriptSubtitle}
      />
      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <AboutIntroduction />
      </div>
      <BookingCTA />
    </>
  );
}
