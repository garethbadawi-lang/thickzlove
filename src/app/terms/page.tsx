import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { legalContent } from "@/data/legal";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for the official Miss Juicy Staxxx website.",
};

export default function TermsPage() {
  const { terms } = legalContent;

  return (
    <>
      <PageIntro heading={terms.title}>
        <p>{terms.notice}</p>
      </PageIntro>
      <div className="mx-auto max-w-3xl space-y-8 px-4 pb-20 sm:px-6">
        <p className="text-xs text-warmgrey">Last updated: {terms.lastUpdated}</p>
        {terms.sections.map((section) => (
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
