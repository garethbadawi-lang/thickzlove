import Image from "next/image";
import { siteConfig } from "@/data/site-config";
import { getSiteContent } from "@/lib/public-content";

export async function AboutIntroduction() {
  const content = await getSiteContent();
  const { about } = content;

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[22px] bg-champagne">
        <Image
          src={siteConfig.profileImage}
          alt={`${siteConfig.name} portrait`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 40vw"
        />
      </div>
      <div>
        <p className="font-script text-3xl text-burgundy">{about.scriptSubtitle}</p>
        {about.paragraphs.map((p) => (
          <p key={p} className="mt-4 text-base leading-relaxed text-warmgrey">
            {p}
          </p>
        ))}

        <dl className="mt-10 grid gap-5 sm:grid-cols-2">
          {[
            ["Personality", about.personality],
            ["Ideal arrangements", about.idealArrangements],
            ["Favourite settings", about.favouriteSettings],
            ["Interests", about.interests],
            ["Dress style", about.dressStyle],
            ["Travel preferences", about.travelPreferences],
            ["Languages", about.languages],
            ["General availability", about.generalAvailability],
          ].map(([label, value]) => (
            <div key={label} className="border-t border-border pt-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-burgundy">
                {label}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-espresso">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
