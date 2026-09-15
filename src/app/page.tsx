import Image from "next/image";
import Link from "next/link";
import { EditorialHero } from "@/components/EditorialHero";
import { BookingCTA } from "@/components/BookingCTA";
import { getFeaturedServices } from "@/data/services";
import { getUpcomingAvailable } from "@/data/availability";
import { getFeaturedGalleryImages } from "@/data/gallery";
import { siteConfig } from "@/data/site-config";
import { formatDisplayDate } from "@/lib/utils";

export default function HomePage() {
  const featured = getFeaturedServices(3);
  const dates = getUpcomingAvailable(4);
  const gallery = getFeaturedGalleryImages(4);

  return (
    <>
      <EditorialHero />

      <section className="bg-champagne/60">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <p className="text-eyebrow">Introduction</p>
          <h2 className="mt-3 font-display text-3xl text-espresso sm:text-4xl">
            A Refined Companion Experience
          </h2>
          <p className="mt-5 text-base leading-relaxed text-warmgrey sm:text-lg">
            Whether you are attending an important event, enjoying dinner in the
            city or simply looking for engaging company, each arrangement is
            approached with care, discretion and attention to detail.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-eyebrow">Services</p>
            <h2 className="mt-2 font-display text-3xl text-espresso sm:text-4xl">
              Featured experiences
            </h2>
          </div>
          <Link href="/services" className="btn-ghost px-0">
            View all services
          </Link>
        </div>

        <div className="divide-y divide-border border-y border-border">
          {featured.map((service) => (
            <div
              key={service.id}
              className="grid gap-3 py-7 md:grid-cols-[1.4fr_auto] md:items-end"
            >
              <div>
                <h3 className="font-script text-[1.9rem] text-espresso">
                  {service.name}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-warmgrey">
                  {service.description}
                </p>
              </div>
              <div className="md:text-right">
                <p className="font-display text-xl text-espresso">
                  {service.priceLabel.replace("Starting from ", "")}
                </p>
                <p className="text-xs uppercase tracking-[0.14em] text-muted">
                  Starting from
                </p>
                <Link
                  href="/services"
                  className="btn-ghost mt-2 inline-flex px-0 text-sm"
                >
                  View details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div className="relative aspect-[3/4] overflow-hidden rounded-[22px] bg-champagne">
            <Image
              src={siteConfig.profileImage}
              alt={`${siteConfig.name} portrait`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div>
            <p className="text-eyebrow">About</p>
            <h2 className="mt-2 font-display text-3xl text-espresso sm:text-4xl">
              {siteConfig.about.heading}
            </h2>
            <p className="mt-3 font-script text-3xl text-burgundy">
              {siteConfig.about.scriptSubtitle}
            </p>
            <p className="mt-5 text-base leading-relaxed text-warmgrey">
              {siteConfig.about.paragraphs[0]}
            </p>
            <Link href="/about" className="btn-secondary mt-8 inline-flex">
              Read more
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-eyebrow">Gallery</p>
            <h2 className="mt-2 font-display text-3xl text-espresso">
              Editorial moments
            </h2>
          </div>
          <Link href="/gallery" className="btn-ghost px-0">
            Open gallery
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {gallery.map((image, i) => (
            <div
              key={image.id}
              className={`relative overflow-hidden rounded-[18px] bg-champagne ${
                i === 0 ? "col-span-2 aspect-[16/10] md:row-span-2 md:aspect-auto md:min-h-[22rem]" : "aspect-[3/4]"
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-champagne/70">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-eyebrow">Availability</p>
              <h2 className="mt-2 font-display text-3xl text-espresso">
                Upcoming dates
              </h2>
              <p className="mt-2 max-w-xl text-sm text-warmgrey">
                Indicative windows only — no private schedule details are
                published.
              </p>
            </div>
            <Link href="/availability" className="btn-ghost px-0">
              View calendar
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {dates.map((day) => (
              <li
                key={day.date}
                className="rounded-[18px] border border-border bg-white px-4 py-5"
              >
                <p className="font-display text-lg text-espresso">
                  {formatDisplayDate(day.date)}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">
                  {day.status}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <BookingCTA />
    </>
  );
}
