import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { legalContent } from "@/data/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for the official Miss Juicy Staxxx website.",
};

export default function PrivacyPage() {
  const { privacy } = legalContent;

  return (
    <>
      <PageIntro heading={privacy.title}>
        <p>{privacy.notice}</p>
      </PageIntro>
      <div className="mx-auto max-w-3xl space-y-8 px-4 pb-20 sm:px-6">
        <p className="text-xs text-warmgrey">
          Last updated: {privacy.lastUpdated}
        </p>
        {privacy.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-2xl text-espresso">
              {section.heading}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-warmgrey">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </>
  );
}
