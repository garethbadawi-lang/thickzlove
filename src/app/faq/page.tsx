import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { FAQAccordion } from "@/components/FAQAccordion";
import { siteConfig } from "@/data/site-config";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about booking with Miss Juicy Staxxx.",
};

export default function FAQPage() {
  return (
    <>
      <PageIntro
        heading="Frequently Asked Questions"
        scriptSubtitle="Clear answers, thoughtfully given."
      >
        <p className="text-sm">{siteConfig.companionshipDisclaimer}</p>
      </PageIntro>
      <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <FAQAccordion />
      </div>
    </>
  );
}
