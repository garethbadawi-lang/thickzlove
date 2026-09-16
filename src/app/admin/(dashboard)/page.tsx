import type { Metadata } from "next";
import Link from "next/link";
import { readBookings } from "@/lib/booking-store";
import { getSiteContent } from "@/lib/public-content";
import { getPublicUpcomingAvailable } from "@/lib/public-content";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

const cards = [
  { href: "/admin/bookings", label: "Bookings", hint: "Review enquiries" },
  { href: "/admin/availability", label: "Availability", hint: "Mark open dates" },
  { href: "/admin/gallery", label: "Gallery", hint: "Photos & order" },
  { href: "/admin/socials", label: "Social Links", hint: "VIP, FREE, X, more" },
  { href: "/admin/homepage", label: "Homepage", hint: "Hero & intro text" },
  { href: "/admin/about", label: "About", hint: "Biography" },
  { href: "/admin/services", label: "Services", hint: "Names, rates, copy" },
  { href: "/admin/faq", label: "FAQ", hint: "Questions & answers" },
  { href: "/admin/settings", label: "Site Settings", hint: "Contact & footer copy" },
  { href: "/admin/security", label: "Security Log", hint: "Login activity" },
] as const;

export default async function AdminHomePage() {
  const [bookings, content, upcoming] = await Promise.all([
    readBookings().catch(() => []),
    getSiteContent(),
    getPublicUpcomingAvailable(8),
  ]);

  const newCount = bookings.filter((b) => b.enquiryStatus === "New").length;
  const galleryCount = content.gallery.filter((g) => g.enabled).length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-eyebrow">Admin</p>
        <h1 className="mt-2 font-display text-3xl text-espresso sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-warmgrey">
          Update the content that changes often. Design, layout and technical
          settings stay with your developer.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-light p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">
            New bookings
          </p>
          <p className="mt-2 font-display text-3xl text-espresso">{newCount}</p>
        </div>
        <div className="card-light p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">
            Available dates
          </p>
          <p className="mt-2 font-display text-3xl text-espresso">
            {upcoming.length}
          </p>
        </div>
        <div className="card-light p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">
            Gallery photos
          </p>
          <p className="mt-2 font-display text-3xl text-espresso">
            {galleryCount}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="card-light block p-5 transition hover:border-gold"
          >
            <p className="font-display text-xl text-espresso">{card.label}</p>
            <p className="mt-1 text-sm text-warmgrey">{card.hint}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
