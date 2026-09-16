import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  patchSiteContentSection,
  readSiteContent,
} from "@/lib/site-content-store";
import {
  deleteGalleryUpload,
  getGalleryStorageUsage,
  isAdminUploadedGallerySrc,
} from "@/lib/gallery-storage";

/** Delete one gallery image: remove Blob/local file + metadata. */
export async function DELETE(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { id?: string };
    const id = String(body.id || "").trim();
    if (!id) {
      return NextResponse.json({ error: "Missing image id." }, { status: 400 });
    }

    const content = await readSiteContent();
    const image = content.gallery.find((g) => g.id === id);
    if (!image) {
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }

    if (isAdminUploadedGallerySrc(image.src)) {
      await deleteGalleryUpload(image.src);
    }

    const gallery = content.gallery.filter((g) => g.id !== id);
    await patchSiteContentSection("gallery", gallery);
    const usage = await getGalleryStorageUsage();

    return NextResponse.json({ gallery, usage });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Unable to delete gallery image.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
