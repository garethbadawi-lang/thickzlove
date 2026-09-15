export type GalleryCategory =
  | "Portraits"
  | "Evening"
  | "Lifestyle"
  | "Travel"
  | "Editorial";

export interface GalleryImage {
  id: string;
  title: string;
  alt: string;
  src: string;
  category: GalleryCategory;
  orientation: "portrait" | "landscape" | "square";
  displayOrder: number;
  featured: boolean;
  enabled: boolean;
}

export const galleryCategories: Array<GalleryCategory | "All"> = [
  "All",
  "Portraits",
  "Evening",
  "Lifestyle",
  "Travel",
  "Editorial",
];

export const galleryCopy = {
  heading: "Gallery",
  scriptSubtitle: "A glimpse into my world.",
} as const;

/** Placeholder images — replace with Love Z Thick photographs. */
export const galleryImages: GalleryImage[] = [
  {
    id: "g1",
    title: "Portrait study",
    alt: "Love Z Thick portrait",
    src: "/images/love-z-thick-gallery-01.svg",
    category: "Portraits",
    orientation: "portrait",
    displayOrder: 1,
    featured: true,
    enabled: true,
  },
  {
    id: "g2",
    title: "Evening light",
    alt: "Love Z Thick",
    src: "/images/love-z-thick-gallery-02.svg",
    category: "Evening",
    orientation: "landscape",
    displayOrder: 2,
    featured: true,
    enabled: true,
  },
  {
    id: "g3",
    title: "Lifestyle moment",
    alt: "Love Z Thick portrait",
    src: "/images/love-z-thick-gallery-03.svg",
    category: "Lifestyle",
    orientation: "portrait",
    displayOrder: 3,
    featured: true,
    enabled: true,
  },
  {
    id: "g4",
    title: "Travel mood",
    alt: "Love Z Thick",
    src: "/images/love-z-thick-gallery-04.svg",
    category: "Travel",
    orientation: "landscape",
    displayOrder: 4,
    featured: true,
    enabled: true,
  },
  {
    id: "g5",
    title: "Editorial frame",
    alt: "Love Z Thick portrait",
    src: "/images/love-z-thick-gallery-05.svg",
    category: "Editorial",
    orientation: "portrait",
    displayOrder: 5,
    featured: false,
    enabled: true,
  },
  {
    id: "g6",
    title: "Soft portrait",
    alt: "Love Z Thick portrait",
    src: "/images/love-z-thick-gallery-06.svg",
    category: "Portraits",
    orientation: "square",
    displayOrder: 6,
    featured: false,
    enabled: true,
  },
];

export function getEnabledGalleryImages() {
  return galleryImages
    .filter((i) => i.enabled)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getFeaturedGalleryImages(limit = 4) {
  return getEnabledGalleryImages()
    .filter((i) => i.featured)
    .slice(0, limit);
}
