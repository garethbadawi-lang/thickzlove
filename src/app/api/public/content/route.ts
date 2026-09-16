import { NextResponse } from "next/server";
import {
  getPublicAvailability,
  getPublicFaqs,
  getPublicGalleryImages,
  getPublicServices,
  getPublicSocials,
  getSiteContent,
} from "@/lib/public-content";

/** Public, non-secret content for client components. */
export async function GET() {
  try {
    const [content, socials, services, faqs, gallery, availability] =
      await Promise.all([
        getSiteContent(),
        getPublicSocials(),
        getPublicServices(),
        getPublicFaqs(),
        getPublicGalleryImages(),
        getPublicAvailability(),
      ]);

    return NextResponse.json({
      homepage: content.homepage,
      about: content.about,
      settings: content.settings,
      socials,
      services,
      faqs,
      gallery,
      availability,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to load content." },
      { status: 500 },
    );
  }
}
