import Link from "next/link";
import { siteConfig } from "@/data/site-config";
import { externalRel } from "@/lib/utils";

interface BookingCTAProps {
  heading?: string;
  buttonLabel?: string;
  href?: string;
}

function isExternal(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

export function BookingCTA({
  heading = "Explore Exclusive Content",
  buttonLabel = siteConfig.mainCta.label,
  href = siteConfig.mainCta.href,
}: BookingCTAProps) {
  const external = isExternal(href);

  return (
    <section className="bg-blush/50">
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
        <p className="font-script text-3xl text-burgundy sm:text-4xl">
          A private invitation
        </p>
        <h2 className="mt-3 font-display text-3xl text-espresso sm:text-4xl">
          {heading}
        </h2>
        {external ? (
          <a
            href={href}
            target="_blank"
            rel={externalRel()}
            className="btn-primary mt-8 inline-flex min-w-[14rem]"
          >
            {buttonLabel}
          </a>
        ) : (
          <Link href={href} className="btn-primary mt-8 inline-flex min-w-[14rem]">
            {buttonLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
