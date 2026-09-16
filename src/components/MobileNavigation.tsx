"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/data/navigation";
import { siteConfig } from "@/data/site-config";
import { cn, externalRel } from "@/lib/utils";

interface MobileNavigationProps {
  open: boolean;
  onClose: () => void;
  mainCta: { label: string; href: string };
}

function isExternal(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

export function MobileNavigation({
  open,
  onClose,
  mainCta,
}: MobileNavigationProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-espresso/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!open}
        onClick={onClose}
      />

      <aside
        id="mobile-nav"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[min(100%,20rem)] flex-col bg-ivory shadow-soft transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!open}
      >
        <div className="border-b border-border px-5 py-5">
          <p className="font-display text-xl text-espresso">{siteConfig.name}</p>
          <p className="mt-1 text-xs text-warmgrey">{siteConfig.username}</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4" aria-label="Mobile">
          {mainNav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "rounded-2xl px-4 py-3 text-base font-medium transition",
                  active
                    ? "bg-blush/60 text-burgundy"
                    : "text-espresso hover:bg-champagne",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          {isExternal(mainCta.href) ? (
            <a
              href={mainCta.href}
              target="_blank"
              rel={externalRel()}
              onClick={onClose}
              className="btn-primary w-full"
            >
              {mainCta.label}
            </a>
          ) : (
            <Link
              href={mainCta.href}
              onClick={onClose}
              className="btn-primary w-full"
            >
              {mainCta.label}
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
