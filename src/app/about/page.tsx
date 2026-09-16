import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { AboutIntroduction } from "@/components/AboutIntroduction";
import { BookingCTA } from "@/components/BookingCTA";
import { siteConfig } from "@/data/site-config";
import { getSiteContent } from "@/lib/public-content";

export const metadata: Metadata = {
  title: "About",
  description: siteConfig.about.paragraphs[0],
};

export default async function AboutPage() {
  const content = await getSiteContent();
  const { about, homepage } = content;

  return (
    <>
      <PageIntro
        heading={about.heading}
        scriptSubtitle={about.scriptSubtitle}
      />
      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <AboutIntroduction />
      </div>
      <BookingCTA
        buttonLabel={homepage.mainCtaLabel}
        href={homepage.mainCtaHref}
      />
    </>
  );
}
