"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { mainNav } from "@/data/navigation";
import { siteConfig } from "@/data/site-config";
import { cn, externalRel } from "@/lib/utils";
import { MobileNavigation } from "./MobileNavigation";

function isExternal(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

export function LightHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-transparent transition",
          scrolled && "border-border bg-ivory/95 backdrop-blur-md shadow-[0_8px_30px_rgba(42,33,30,0.06)]",
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="group min-w-0">
            <span className="font-display text-xl tracking-wide text-espresso transition group-hover:text-burgundy sm:text-2xl">
              {siteConfig.name}
            </span>
            <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-warmgrey">
              {siteConfig.username}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {mainNav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm font-medium transition",
                    active
                      ? "text-burgundy"
                      : "text-warmgrey hover:text-espresso",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {isExternal(siteConfig.mainCta.href) ? (
              <a
                href={siteConfig.mainCta.href}
                target="_blank"
                rel={externalRel()}
                className="btn-primary hidden sm:inline-flex"
              >
                {siteConfig.mainCta.label}
              </a>
            ) : (
              <Link
                href={siteConfig.mainCta.href}
                className="btn-primary hidden sm:inline-flex"
              >
                {siteConfig.mainCta.label}
              </Link>
            )}
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-white text-espresso lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      <MobileNavigation open={open} onClose={() => setOpen(false)} />
    </>
  );
}
