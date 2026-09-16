import { promises as fs } from "fs";
import path from "path";
import { del, list } from "@vercel/blob";

/** Site-specific Blob prefix — only this site's gallery uploads. */
export const GALLERY_BLOB_PREFIX = "love-z-thick/gallery/";

const LOCAL_UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "love-z-thick",
  "gallery",
);

const LOCAL_PUBLIC_PREFIX = "/uploads/love-z-thick/gallery/";

/** Max size for a single gallery image (bytes). */
export const GALLERY_MAX_FILE_BYTES = 8 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "avif"]);

export function isBlobStorageEnabled() {
  return (
    process.env.VERCEL === "1" &&
    Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)
  );
}

export function getGalleryStorageLimitBytes(): number {
  const raw = process.env.GALLERY_STORAGE_LIMIT_MB?.trim();
  const mb = raw ? Number(raw) : 100;
  if (!Number.isFinite(mb) || mb <= 0) return 100 * 1024 * 1024;
  return Math.floor(mb * 1024 * 1024);
}

export function getGalleryStorageLimitMb(): number {
  return Math.round(getGalleryStorageLimitBytes() / (1024 * 1024));
}

export function isAllowedGalleryMime(type: string): boolean {
  return ALLOWED_MIME.has(type.toLowerCase());
}

export function extensionForGalleryFile(file: File): string | null {
  const fromName = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (fromName && ALLOWED_EXT.has(fromName)) return fromName === "jpeg" ? "jpg" : fromName;

  switch (file.type.toLowerCase()) {
    case "image/jpeg":
    case "image/jpg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    default:
      return null;
  }
}

export type GalleryStorageUsage = {
  usedBytes: number;
  limitBytes: number;
  remainingBytes: number;
  usedMb: number;
  limitMb: number;
  remainingMb: number;
  percent: number;
  fileCount: number;
};

function roundMb(bytes: number): number {
  return Math.round((bytes / (1024 * 1024)) * 10) / 10;
}

export function formatStorageUsage(
  usedBytes: number,
  limitBytes = getGalleryStorageLimitBytes(),
  fileCount = 0,
): GalleryStorageUsage {
  const remainingBytes = Math.max(0, limitBytes - usedBytes);
  const percent =
    limitBytes > 0
      ? Math.min(100, Math.round((usedBytes / limitBytes) * 1000) / 10)
      : 100;
  return {
    usedBytes,
    limitBytes,
    remainingBytes,
    usedMb: roundMb(usedBytes),
    limitMb: Math.round(limitBytes / (1024 * 1024)),
    remainingMb: roundMb(remainingBytes),
    percent,
    fileCount,
  };
}

async function sumLocalUploadBytes(): Promise<{ bytes: number; count: number }> {
  try {
    const entries = await fs.readdir(LOCAL_UPLOAD_DIR, { withFileTypes: true });
    let bytes = 0;
    let count = 0;
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const stat = await fs.stat(path.join(LOCAL_UPLOAD_DIR, entry.name));
      bytes += stat.size;
      count += 1;
    }
    return { bytes, count };
  } catch {
    return { bytes: 0, count: 0 };
  }
}

async function sumBlobUploadBytes(): Promise<{ bytes: number; count: number }> {
  let bytes = 0;
  let count = 0;
  let cursor: string | undefined;

  do {
    const page = await list({
      prefix: GALLERY_BLOB_PREFIX,
      cursor,
      limit: 1000,
    });
    for (const blob of page.blobs) {
      bytes += blob.size;
      count += 1;
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return { bytes, count };
}

/** Durable usage for this site's admin gallery uploads only. */
export async function getGalleryStorageUsage(): Promise<GalleryStorageUsage> {
  const limitBytes = getGalleryStorageLimitBytes();
  const { bytes, count } = isBlobStorageEnabled()
    ? await sumBlobUploadBytes()
    : await sumLocalUploadBytes();
  return formatStorageUsage(bytes, limitBytes, count);
}

export function isAdminUploadedGallerySrc(src: string): boolean {
  if (!src) return false;
  if (src.startsWith(LOCAL_PUBLIC_PREFIX)) return true;
  if (src.includes(`/${GALLERY_BLOB_PREFIX}`)) return true;
  // Legacy path from earlier CMS uploads (still deletable, not counted in new prefix sum)
  if (src.includes("/gallery/") && src.includes("blob.vercel-storage.com")) {
    return true;
  }
  return false;
}

export function buildGalleryBlobPathname(id: string, ext: string): string {
  return `${GALLERY_BLOB_PREFIX}${id}.${ext}`;
}

export function getLocalGalleryDir(): string {
  return LOCAL_UPLOAD_DIR;
}

export function buildLocalGalleryPublicSrc(filename: string): string {
  return `${LOCAL_PUBLIC_PREFIX}${filename}`;
}

export async function deleteGalleryUpload(src: string): Promise<void> {
  if (!isAdminUploadedGallerySrc(src)) return;

  if (src.startsWith(LOCAL_PUBLIC_PREFIX)) {
    const filename = src.slice(LOCAL_PUBLIC_PREFIX.length);
    if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return;
    }
    try {
      await fs.unlink(path.join(LOCAL_UPLOAD_DIR, filename));
    } catch {
      // Already gone
    }
    return;
  }

  if (isBlobStorageEnabled()) {
    try {
      await del(src);
    } catch {
      // Missing blob should not block metadata removal
    }
  }
}

export function quotaExceededMessage(usage: GalleryStorageUsage): string {
  return (
    `Gallery storage limit reached.\n` +
    `You are currently using ${usage.usedMb} MB of your ${usage.limitMb} MB allowance.\n` +
    `Delete some existing images before uploading more.`
  );
}
