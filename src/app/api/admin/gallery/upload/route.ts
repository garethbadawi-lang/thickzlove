import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  patchSiteContentSection,
  readSiteContent,
} from "@/lib/site-content-store";
import type { GalleryImage } from "@/data/gallery";
import {
  GALLERY_MAX_FILE_BYTES,
  buildGalleryBlobPathname,
  buildLocalGalleryPublicSrc,
  deleteGalleryUpload,
  extensionForGalleryFile,
  getGalleryStorageUsage,
  getLocalGalleryDir,
  isAllowedGalleryMime,
  isBlobStorageEnabled,
  quotaExceededMessage,
} from "@/lib/gallery-storage";

function collectFiles(form: FormData): File[] {
  const files: File[] = [];
  for (const value of form.getAll("files")) {
    if (value instanceof File && value.size > 0) files.push(value);
  }
  for (const value of form.getAll("file")) {
    if (value instanceof File && value.size > 0) files.push(value);
  }
  return files;
}

function hashBytes(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const writtenSrcs: string[] = [];

  try {
    const form = await req.formData();
    const files = collectFiles(form);
    if (!files.length) {
      return NextResponse.json({ error: "Missing image file." }, { status: 400 });
    }

    const prepared: Array<{
      file: File;
      bytes: Buffer;
      ext: string;
      contentHash: string;
    }> = [];

    for (const file of files) {
      if (!isAllowedGalleryMime(file.type)) {
        return NextResponse.json(
          {
            error:
              "Unsupported file type. Please upload JPEG, PNG, WebP or AVIF images.",
          },
          { status: 400 },
        );
      }
      const ext = extensionForGalleryFile(file);
      if (!ext) {
        return NextResponse.json(
          {
            error:
              "Unsupported file type. Please upload JPEG, PNG, WebP or AVIF images.",
          },
          { status: 400 },
        );
      }

      const bytes = Buffer.from(await file.arrayBuffer());
      if (bytes.byteLength > GALLERY_MAX_FILE_BYTES) {
        return NextResponse.json(
          { error: "This image is too large. Maximum image size is 8 MB." },
          { status: 400 },
        );
      }
      prepared.push({ file, bytes, ext, contentHash: hashBytes(bytes) });
    }

    const batchHashes = new Set<string>();
    for (const item of prepared) {
      if (batchHashes.has(item.contentHash)) {
        return NextResponse.json(
          {
            error: `Duplicate image in selection: “${item.file.name}” is identical to another selected file.`,
          },
          { status: 400 },
        );
      }
      batchHashes.add(item.contentHash);
    }

    const usage = await getGalleryStorageUsage();
    const incomingBytes = prepared.reduce(
      (sum, item) => sum + item.bytes.byteLength,
      0,
    );
    if (usage.usedBytes + incomingBytes > usage.limitBytes) {
      return NextResponse.json(
        { error: quotaExceededMessage(usage), usage },
        { status: 413 },
      );
    }

    const content = await readSiteContent();
    const existingHashes = new Set(
      content.gallery
        .map((g) => g.contentHash)
        .filter((h): h is string => Boolean(h)),
    );
    for (const item of prepared) {
      if (existingHashes.has(item.contentHash)) {
        return NextResponse.json(
          {
            error: `“${item.file.name}” is an exact duplicate of an image already in the gallery.`,
          },
          { status: 409 },
        );
      }
    }

    let maxOrder = content.gallery.reduce(
      (max, img) => Math.max(max, img.displayOrder),
      0,
    );
    const uploaded: GalleryImage[] = [];
    const useBlob = isBlobStorageEnabled();

    for (const item of prepared) {
      const id = crypto.randomUUID();
      let src: string;

      if (useBlob) {
        const pathname = buildGalleryBlobPathname(id, item.ext);
        const result = await put(pathname, item.bytes, {
          access: "public",
          contentType: item.file.type,
          addRandomSuffix: false,
        });
        src = result.url;
      } else {
        const dir = getLocalGalleryDir();
        await fs.mkdir(dir, { recursive: true });
        const filename = `${id}.${item.ext}`;
        await fs.writeFile(path.join(dir, filename), item.bytes);
        src = buildLocalGalleryPublicSrc(filename);
      }
      writtenSrcs.push(src);

      maxOrder += 1;
      const title =
        String(form.get("title") || "").trim() ||
        item.file.name.replace(/\.[^.]+$/, "") ||
        "Gallery photo";
      const alt = String(form.get("alt") || "").trim() || title;

      uploaded.push({
        id,
        title,
        alt,
        src,
        category: "Portraits",
        orientation: "portrait",
        displayOrder: maxOrder,
        featured: false,
        enabled: true,
        contentHash: item.contentHash,
      });
    }

    const gallery = [...content.gallery, ...uploaded];
    await patchSiteContentSection("gallery", gallery);
    const nextUsage = await getGalleryStorageUsage();

    return NextResponse.json({
      images: uploaded,
      image: uploaded[0],
      gallery,
      usage: nextUsage,
    });
  } catch (e) {
    for (const src of writtenSrcs) {
      await deleteGalleryUpload(src).catch(() => undefined);
    }
    const message =
      e instanceof Error ? e.message : "Unable to upload gallery image.";
    const status = message.includes("storage limit")
      ? 413
      : message.includes("too large")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
