import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { GalleryGrid } from "@/components/GalleryGrid";
import { galleryCopy } from "@/data/gallery";
import { getPublicGalleryImages } from "@/lib/public-content";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Editorial gallery of Love Z Thick.",
};

export default async function GalleryPage() {
  const images = await getPublicGalleryImages();

  return (
    <>
      <PageIntro
        heading={galleryCopy.heading}
        scriptSubtitle={galleryCopy.scriptSubtitle}
      />
      <div className="mx-auto max-w-6xl space-y-12 px-4 pb-20 sm:px-6">
        <GalleryGrid images={images} />
        <div className="rounded-[18px] border border-border bg-champagne/60 p-6 text-center">
          <p className="font-display text-2xl text-espresso">18+ Gallery</p>
          <p className="mt-2 text-sm text-warmgrey">
            An optional entrance for mature creator-owned imagery may be enabled
            later. Public gallery images remain tasteful and non-explicit.
          </p>
        </div>
      </div>
    </>
  );
}
