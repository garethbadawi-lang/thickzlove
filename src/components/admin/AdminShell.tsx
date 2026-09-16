"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "@/data/site-config";
import { clsx } from "clsx";

const navItems = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/availability", label: "Availability" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/socials", label: "Social Links" },
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/about", label: "About" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/faq", label: "FAQ" },
  { href: "/admin/settings", label: "Site Settings" },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/login", { method: "DELETE" });
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="min-h-screen bg-ivory">
      <div className="border-b border-border bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="font-script text-2xl text-burgundy">{siteConfig.name}</p>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">
              Admin
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="btn-ghost hidden sm:inline-flex" target="_blank">
              View site
            </Link>
            <button
              type="button"
              className="btn-secondary lg:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "Close" : "Menu"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => void logout()}
              disabled={loggingOut}
            >
              {loggingOut ? "Signing out…" : "Log Out"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[15rem_1fr]">
        <aside
          className={clsx(
            "card-light h-fit p-3 lg:sticky lg:top-6",
            open ? "block" : "hidden lg:block",
          )}
        >
          <nav className="flex flex-col gap-1" aria-label="Admin">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  isActive(item.href, "exact" in item && item.exact)
                    ? "bg-blush text-burgundy"
                    : "text-warmgrey hover:bg-champagne/60 hover:text-espresso",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
