"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  galleryCategories,
  getEnabledGalleryImages,
  type GalleryCategory,
  type GalleryImage,
} from "@/data/gallery";
import { cn } from "@/lib/utils";
import { GalleryLightbox } from "./GalleryLightbox";

export function GalleryGrid({
  images,
  matureGate = false,
}: {
  images?: GalleryImage[];
  matureGate?: boolean;
}) {
  const all = images ?? getEnabledGalleryImages();
  const [category, setCategory] = useState<GalleryCategory | "All">("All");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [matureUnlocked, setMatureUnlocked] = useState(false);

  const filtered = useMemo(() => {
    if (category === "All") return all;
    return all.filter((i) => i.category === category);
  }, [all, category]);

  return (
    <div>
      {matureGate && !matureUnlocked && (
        <div className="mb-8 rounded-[18px] border border-border bg-champagne/60 p-6 text-center">
          <p className="font-display text-2xl text-espresso">18+ Gallery</p>
          <p className="mt-2 text-sm text-warmgrey">
            Optional mature creator-owned imagery may be added later. Enter only
            if you are an adult.
          </p>
          <button
            type="button"
            className="btn-secondary mt-4"
            onClick={() => setMatureUnlocked(true)}
          >
            Enter 18+ Gallery
          </button>
        </div>
      )}

      {(!matureGate || matureUnlocked) && (
        <>
          <div className="mb-8 flex flex-wrap gap-2">
            {galleryCategories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "min-h-10 rounded-full border px-4 text-sm font-medium transition",
                  category === c
                    ? "border-burgundy bg-burgundy text-white"
                    : "border-border bg-white text-espresso hover:border-gold",
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {filtered.map((image, index) => (
              <button
                key={image.id}
                type="button"
                className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-[18px] border border-border bg-white text-left transition hover:shadow-soft"
                onClick={() => setActiveIndex(index)}
              >
                <div
                  className={cn(
                    "relative w-full bg-champagne",
                    image.orientation === "landscape"
                      ? "aspect-[4/3]"
                      : image.orientation === "square"
                        ? "aspect-square"
                        : "aspect-[3/4]",
                  )}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="px-4 py-3">
                  <p className="font-display text-lg text-espresso">
                    {image.title}
                  </p>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">
                    {image.category}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {activeIndex !== null && (
            <GalleryLightbox
              images={filtered}
              index={activeIndex}
              onClose={() => setActiveIndex(null)}
              onChange={setActiveIndex}
            />
          )}
        </>
      )}
    </div>
  );
}
