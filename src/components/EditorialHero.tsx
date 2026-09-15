import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/data/site-config";
import { getEnabledSocials } from "@/data/socials";
import { externalRel } from "@/lib/utils";

function isExternal(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

const NATIVE_COLOR_ICONS = new Set(["xvideos-x", "pornhub-ph"]);

function TileBrandIcon({ icon }: { icon: string }) {
  const src = `/brand-icons/${icon}.svg`;

  if (NATIVE_COLOR_ICONS.has(icon)) {
    return (
      <span
        className="flex size-6 shrink-0 items-center justify-center"
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
      className="flex size-6 shrink-0 items-center justify-center"
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

export function EditorialHero() {
  const socials = getEnabledSocials();

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
          <p className="text-eyebrow">{siteConfig.tagline}</p>
          <p className="mt-4 font-display text-4xl leading-[1.1] text-espresso sm:text-5xl lg:text-[3.4rem]">
            {siteConfig.name}
          </p>
          <h1 className="mt-5 font-display text-3xl italic leading-tight text-burgundy sm:text-4xl">
            {siteConfig.heroHeading}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-warmgrey sm:text-lg">
            {siteConfig.heroDescription}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            {isExternal(siteConfig.mainCta.href) ? (
              <a
                href={siteConfig.mainCta.href}
                target="_blank"
                rel={externalRel()}
                className="btn-primary"
              >
                {siteConfig.mainCta.label}
              </a>
            ) : (
              <Link href={siteConfig.mainCta.href} className="btn-primary">
                {siteConfig.mainCta.label}
              </Link>
            )}
            {isExternal(siteConfig.secondaryCta.href) ? (
              <a
                href={siteConfig.secondaryCta.href}
                target="_blank"
                rel={externalRel()}
                className="btn-secondary"
              >
                {siteConfig.secondaryCta.label}
              </a>
            ) : (
              <Link href={siteConfig.secondaryCta.href} className="btn-secondary">
                {siteConfig.secondaryCta.label}
              </Link>
            )}
          </div>

          {socials.length > 0 && (
            <ul className="mt-6 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
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
                    <ArrowUpRight
                      className="ml-auto size-3.5 shrink-0 opacity-55"
                      aria-hidden
                    />
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
            {siteConfig.heroScript}
          </p>
        </div>
      </div>
    </section>
  );
}
