import { servicesPageCopy } from "@/data/services";
import { siteConfig } from "@/data/site-config";

export function ServiceDisclaimer() {
  return (
    <aside className="rounded-[18px] border border-border bg-champagne/70 p-6 sm:p-8">
      <p className="text-sm leading-relaxed text-espresso sm:text-base">
        {siteConfig.companionshipDisclaimer}
      </p>
      <ul className="mt-5 space-y-2 text-sm text-warmgrey">
        {servicesPageCopy.disclaimers.slice(1).map((line) => (
          <li key={line} className="flex gap-2">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-gold" aria-hidden />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
