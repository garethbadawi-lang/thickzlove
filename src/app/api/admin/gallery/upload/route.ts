import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  patchSiteContentSection,
  readSiteContent,
} from "@/lib/site-content-store";
import type { GalleryImage } from "@/data/gallery";

function isBlobStorageEnabled() {
  return (
    process.env.VERCEL === "1" &&
    Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)
  );
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing image file." }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image uploads are allowed." },
        { status: 400 },
      );
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image must be under 8MB." },
        { status: 400 },
      );
    }

    const id = crypto.randomUUID();
    const ext =
      file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
      "jpg";
    const pathname = `gallery/${id}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    let src: string;
    if (isBlobStorageEnabled()) {
      const uploaded = await put(pathname, bytes, {
        access: "public",
        contentType: file.type,
        addRandomSuffix: false,
      });
      src = uploaded.url;
    } else {
      const dir = path.join(process.cwd(), "public", "uploads", "gallery");
      await fs.mkdir(dir, { recursive: true });
      const filename = `${id}.${ext}`;
      await fs.writeFile(path.join(dir, filename), bytes);
      src = `/uploads/gallery/${filename}`;
    }

    const content = await readSiteContent();
    const maxOrder = content.gallery.reduce(
      (max, img) => Math.max(max, img.displayOrder),
      0,
    );
    const title =
      String(form.get("title") || "").trim() ||
      file.name.replace(/\.[^.]+$/, "") ||
      "Gallery photo";
    const alt = String(form.get("alt") || "").trim() || title;

    const image: GalleryImage = {
      id,
      title,
      alt,
      src,
      category: "Portraits",
      orientation: "portrait",
      displayOrder: maxOrder + 1,
      featured: false,
      enabled: true,
    };

    const gallery = [...content.gallery, image];
    await patchSiteContentSection("gallery", gallery);
    return NextResponse.json({ image, gallery });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Unable to upload gallery image.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
