import Link from "next/link";
import { footerNav } from "@/data/navigation";
import { siteConfig } from "@/data/site-config";
import { getEnabledSocials } from "@/data/socials";
import { externalRel } from "@/lib/utils";

export function LightFooter() {
  const socials = getEnabledSocials();

  return (
    <footer className="bg-footer text-champagne">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="font-display text-3xl text-white">{siteConfig.name}</p>
            <p className="mt-2 font-script text-2xl text-gold">
              {siteConfig.username}
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-champagne/75">
              {siteConfig.footer.message}
            </p>
            <p className="mt-4 max-w-lg text-xs leading-relaxed text-champagne/55">
              {siteConfig.companionshipDisclaimer}
            </p>
          </div>

          <div>
            <p className="text-eyebrow text-gold">Explore</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-champagne/80 transition hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {socials.length > 0 && (
              <div className="mt-8">
                <p className="text-eyebrow text-gold">Connect</p>
                <ul className="mt-3 flex flex-wrap gap-3">
                  {socials.map((s) => (
                    <li key={s.id}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel={externalRel()}
                        className="text-sm text-champagne/80 hover:text-white"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-champagne/50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div>
              <p>{siteConfig.footer.copyright}</p>
              <p className="mt-2">{siteConfig.footer.trademark}</p>
            </div>
            <p className="text-[12px] leading-relaxed text-champagne/65 sm:text-right">
              <span className="block">Site created by:</span>
              <a
                href="https://x.com/sammy4354"
                target="_blank"
                rel={externalRel()}
                className="mt-1 block text-champagne/75 transition hover:text-gold hover:underline underline-offset-2"
              >
                X/Twitter: @sammy4354
              </a>
              <a
                href="mailto:garethbadawi@gmail.com"
                className="mt-0.5 block text-champagne/75 transition hover:text-gold hover:underline underline-offset-2"
              >
                Email: garethbadawi@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
