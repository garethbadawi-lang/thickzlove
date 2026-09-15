"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryImage } from "@/data/gallery";

interface GalleryLightboxProps {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onChange: (index: number) => void;
}

export function GalleryLightbox({
  images,
  index,
  onClose,
  onChange,
}: GalleryLightboxProps) {
  const image = images[index];
  const touchX = useRef(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")
        onChange((index - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") onChange((index + 1) % images.length);
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, images.length, onChange, onClose]);

  if (!image) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.title}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-espresso/80 p-4"
      onClick={onClose}
      onTouchStart={(e) => {
        touchX.current = e.changedTouches[0]?.clientX ?? 0;
      }}
      onTouchEnd={(e) => {
        const endX = e.changedTouches[0]?.clientX ?? 0;
        const delta = endX - touchX.current;
        if (Math.abs(delta) < 50) return;
        if (delta > 0) onChange((index - 1 + images.length) % images.length);
        else onChange((index + 1) % images.length);
      }}
    >
      <div
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute -top-12 right-0 inline-flex size-11 items-center justify-center rounded-full bg-white text-espresso"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-champagne sm:aspect-[16/10]">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-white">
          <div>
            <p className="font-display text-2xl">{image.title}</p>
            <p className="text-sm text-white/70">{image.category}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-full bg-white/15"
              aria-label="Previous image"
              onClick={() =>
                onChange((index - 1 + images.length) % images.length)
              }
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-full bg-white/15"
              aria-label="Next image"
              onClick={() => onChange((index + 1) % images.length)}
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
