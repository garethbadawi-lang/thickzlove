import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/data/site-config";
import { getSiteContent } from "@/lib/public-content";
import {
  NATIVE_COLOR_SOCIAL_ICONS,
  resolveSocialIcon,
} from "@/lib/social-links";
import { externalRel } from "@/lib/utils";

function isExternal(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

function TileBrandIcon({ icon }: { icon: string }) {
  const resolved = resolveSocialIcon(icon);
  const src = `/brand-icons/${resolved}.svg`;

  if (NATIVE_COLOR_SOCIAL_ICONS.has(resolved)) {
    return (
      <span
        className="flex size-[22px] shrink-0 items-center justify-center"
        aria-hidden
      >
        <img
          src={src}
          alt=""
          width={20}
          height={20}
          className="size-5 object-contain"
        />
      </span>
    );
  }

  return (
    <span
      className="flex size-[22px] shrink-0 items-center justify-center"
      aria-hidden
    >
      <span
        className="inline-block size-5 bg-current"
        style={{
          WebkitMaskImage: `url(${src})`,
          maskImage: `url(${src})`,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />
    </span>
  );
}

export async function EditorialHero() {
  const content = await getSiteContent();
  const socials = content.socials.filter((s) => s.enabled);
  const mainCta = {
    label: content.homepage.mainCtaLabel,
    href: content.homepage.mainCtaHref,
  };
  const secondaryCta = {
    label: content.homepage.secondaryCtaLabel,
    href: content.homepage.secondaryCtaHref,
  };

  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -right-24 top-10 size-72 rounded-full bg-blush/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 size-64 rounded-full bg-champagne blur-2xl"
        aria-hidden
      />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:py-20">
        <div className="fade-in order-2 lg:order-1">
          <p className="text-eyebrow">{content.homepage.tagline}</p>
          <p className="mt-4 font-display text-4xl leading-[1.1] text-espresso sm:text-5xl lg:text-[3.4rem]">
            {siteConfig.name}
          </p>
          <h1 className="mt-5 font-display text-3xl italic leading-tight text-burgundy sm:text-4xl">
            {content.homepage.heroHeading}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-warmgrey sm:text-lg">
            {content.homepage.heroDescription}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            {isExternal(mainCta.href) ? (
              <a
                href={mainCta.href}
                target="_blank"
                rel={externalRel()}
                className="btn-primary"
              >
                {mainCta.label}
              </a>
            ) : (
              <Link href={mainCta.href} className="btn-primary">
                {mainCta.label}
              </Link>
            )}
            {isExternal(secondaryCta.href) ? (
              <a
                href={secondaryCta.href}
                target="_blank"
                rel={externalRel()}
                className="btn-secondary"
              >
                {secondaryCta.label}
              </a>
            ) : (
              <Link href={secondaryCta.href} className="btn-secondary">
                {secondaryCta.label}
              </Link>
            )}
          </div>

          {socials.length > 0 && (
            <ul className="mt-6 grid w-full grid-cols-2 gap-3 lg:grid-cols-4">
              {socials.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel={externalRel()}
                    className="link-tile"
                  >
                    <TileBrandIcon icon={s.icon} />
                    <span className="whitespace-nowrap">{s.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/availability"
            className="btn-ghost mt-4 inline-flex px-0"
          >
            View Availability
          </Link>
        </div>

        <div className="fade-in relative order-1 lg:order-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-champagne">
            <Image
              src={siteConfig.heroImage}
              alt={`${siteConfig.name} portrait`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <p className="pointer-events-none absolute -bottom-3 left-4 font-script text-[1.65rem] text-burgundy sm:left-6 sm:text-3xl">
            {content.homepage.heroScript}
          </p>
        </div>
      </div>
    </section>
  );
}
