import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { ContactPanel } from "@/components/ContactPanel";
import { getPublicSocials, getSiteContent } from "@/lib/public-content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Love Z Thick for general questions, collaboration or booking assistance.",
};

export default async function ContactPage() {
  const [content, socials] = await Promise.all([
    getSiteContent(),
    getPublicSocials(),
  ]);

  return (
    <>
      <PageIntro
        heading="Contact Love Z Thick"
        scriptSubtitle="A private word, carefully received."
      >
        <p>
          For general questions, collaboration enquiries or assistance with a
          booking request, use one of the official methods below.
        </p>
      </PageIntro>
      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <ContactPanel
          socials={socials}
          responseTime={content.settings.responseTime}
          privacyNote={content.settings.contactPrivacyNote}
          successMessage={content.settings.contactSuccessMessage}
          mainCta={{
            label: content.homepage.mainCtaLabel,
            href: content.homepage.mainCtaHref,
          }}
        />
      </div>
    </>
  );
}
