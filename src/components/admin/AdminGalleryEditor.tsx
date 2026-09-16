"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminSaveBar,
  saveContentSection,
} from "@/components/admin/AdminSaveBar";
import type { GalleryImage } from "@/data/gallery";
import { galleryCategories } from "@/data/gallery";

type StorageUsage = {
  usedBytes: number;
  limitBytes: number;
  remainingBytes: number;
  usedMb: number;
  limitMb: number;
  remainingMb: number;
  percent: number;
  fileCount: number;
};

type ItemStatus =
  | "ready"
  | "invalid"
  | "duplicate"
  | "waiting"
  | "uploading"
  | "uploaded"
  | "failed";

type PendingItem = {
  localId: string;
  file: File;
  previewUrl: string;
  sizeLabel: string;
  status: ItemStatus;
  message?: string;
  contentHash?: string;
};

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/jpg,image/png,image/webp,image/avif";
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
]);

function formatMb(bytes: number): string {
  return `${(Math.round((bytes / (1024 * 1024)) * 10) / 10).toFixed(1)} MB`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return formatMb(bytes);
}

async function sha256File(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function looksLikeImageFile(file: File): boolean {
  if (ALLOWED_TYPES.has(file.type.toLowerCase())) return true;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return Boolean(ext && ["jpg", "jpeg", "png", "webp", "avif"].includes(ext));
}

async function canDecodeImage(file: File): Promise<boolean> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      bitmap.close();
      return true;
    } catch {
      return false;
    }
  }
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(true);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };
    img.src = url;
  });
}

function statusLabel(status: ItemStatus): string {
  switch (status) {
    case "ready":
      return "Ready";
    case "invalid":
      return "Invalid";
    case "duplicate":
      return "Duplicate";
    case "waiting":
      return "Waiting";
    case "uploading":
      return "Uploading";
    case "uploaded":
      return "Uploaded";
    case "failed":
      return "Failed";
  }
}

export function AdminGalleryEditor() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [usage, setUsage] = useState<StorageUsage | null>(null);
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const uploadLock = useRef(false);

  async function reload() {
    const [contentRes, storageRes] = await Promise.all([
      fetch("/api/admin/content"),
      fetch("/api/admin/gallery/storage"),
    ]);
    if (contentRes.status === 401 || storageRes.status === 401) {
      router.replace("/admin/login");
      return;
    }
    if (!contentRes.ok) throw new Error("Unable to load gallery.");
    if (!storageRes.ok) throw new Error("Unable to load storage usage.");

    const contentData = (await contentRes.json()) as {
      content: { gallery: GalleryImage[] };
    };
    const storageData = (await storageRes.json()) as { usage: StorageUsage };

    setGallery(
      [...(contentData.content.gallery || [])].sort(
        (a, b) => a.displayOrder - b.displayOrder,
      ),
    );
    setUsage(storageData.usage);
  }

  useEffect(() => {
    void (async () => {
      try {
        await reload();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    return () => {
      for (const item of pending) {
        URL.revokeObjectURL(item.previewUrl);
      }
    };
    // Only revoke on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validPending = useMemo(
    () => pending.filter((p) => p.status === "ready"),
    [pending],
  );
  const selectedBytes = useMemo(
    () =>
      pending
        .filter((p) =>
          ["ready", "waiting", "uploading", "uploaded"].includes(p.status),
        )
        .reduce((sum, p) => sum + p.file.size, 0),
    [pending],
  );
  const readyBytes = useMemo(
    () => validPending.reduce((sum, p) => sum + p.file.size, 0),
    [validPending],
  );

  const quotaBlockMessage = useMemo(() => {
    if (!usage || readyBytes <= 0) return null;
    if (usage.usedBytes + readyBytes <= usage.limitBytes) return null;
    return (
      `These images would exceed your gallery storage allowance.\n` +
      `Current usage: ${usage.usedMb} MB\n` +
      `Selected upload: ${formatMb(readyBytes)}\n` +
      `Available space: ${usage.remainingMb} MB`
    );
  }, [usage, readyBytes]);

  async function buildPendingItems(
    files: File[],
    alreadyQueuedHashes: Set<string>,
  ): Promise<PendingItem[]> {
    const existingHashes = new Set(
      gallery.map((g) => g.contentHash).filter((h): h is string => Boolean(h)),
    );
    const seenHashes = new Set<string>(alreadyQueuedHashes);
    const items: PendingItem[] = [];

    for (const file of files) {
      const previewUrl = URL.createObjectURL(file);
      const base: PendingItem = {
        localId: crypto.randomUUID(),
        file,
        previewUrl,
        sizeLabel: formatBytes(file.size),
        status: "ready",
      };

      if (!looksLikeImageFile(file)) {
        items.push({
          ...base,
          status: "invalid",
          message: "Unsupported file type. Use JPEG, PNG, WebP or AVIF.",
        });
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        items.push({
          ...base,
          status: "invalid",
          message: "This image is too large. Maximum image size is 8 MB.",
        });
        continue;
      }

      const readable = await canDecodeImage(file);
      if (!readable) {
        items.push({
          ...base,
          status: "invalid",
          message: "This file could not be read as a valid image.",
        });
        continue;
      }

      let contentHash: string | undefined;
      try {
        contentHash = await sha256File(file);
      } catch {
        contentHash = undefined;
      }

      if (
        contentHash &&
        (existingHashes.has(contentHash) || seenHashes.has(contentHash))
      ) {
        items.push({
          ...base,
          status: "duplicate",
          contentHash,
          message: existingHashes.has(contentHash)
            ? "Exact duplicate of an image already in the gallery."
            : "Exact duplicate of another selected file.",
        });
        continue;
      }

      if (contentHash) seenHashes.add(contentHash);
      items.push({ ...base, status: "ready", contentHash });
    }

    return items;
  }

  async function addFiles(fileList: FileList | File[] | null) {
    if (!fileList || uploading) return;
    const files = Array.from(fileList);
    if (!files.length) return;
    setError(null);
    setSummary(null);
    const alreadyQueuedHashes = new Set(
      pending
        .map((p) => p.contentHash)
        .filter((h): h is string => Boolean(h)),
    );
    const items = await buildPendingItems(files, alreadyQueuedHashes);
    setPending((prev) => [...prev, ...items]);
  }

  function removePending(localId: string) {
    setPending((prev) => {
      const target = prev.find((p) => p.localId === localId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.localId !== localId);
    });
  }

  function clearPending() {
    setPending((prev) => {
      for (const item of prev) URL.revokeObjectURL(item.previewUrl);
      return [];
    });
  }

  async function startUpload() {
    if (uploadLock.current || uploading) return;
    setError(null);
    setSummary(null);

    const toUpload = pending.filter((p) => p.status === "ready");
    if (!toUpload.length) {
      setError("No valid images selected to upload.");
      return;
    }
    if (quotaBlockMessage) {
      setError(quotaBlockMessage);
      return;
    }

    uploadLock.current = true;
    setUploading(true);
    setPending((prev) =>
      prev.map((p) =>
        p.status === "ready" ? { ...p, status: "waiting" as const } : p,
      ),
    );

    let successCount = 0;
    let failCount = 0;

    try {
      for (const item of toUpload) {
        setPending((prev) =>
          prev.map((p) =>
            p.localId === item.localId
              ? { ...p, status: "uploading", message: undefined }
              : p,
          ),
        );

        try {
          const form = new FormData();
          form.append("files", item.file);
          const res = await fetch("/api/admin/gallery/upload", {
            method: "POST",
            body: form,
          });
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
            usage?: StorageUsage;
            gallery?: GalleryImage[];
          };

          if (!res.ok) {
            failCount += 1;
            setPending((prev) =>
              prev.map((p) =>
                p.localId === item.localId
                  ? {
                      ...p,
                      status: "failed",
                      message: data.error || "Upload failed.",
                    }
                  : p,
              ),
            );
            if (data.usage) setUsage(data.usage);
            continue;
          }

          successCount += 1;
          if (data.gallery) {
            setGallery(
              [...data.gallery].sort((a, b) => a.displayOrder - b.displayOrder),
            );
          }
          if (data.usage) setUsage(data.usage);
          setPending((prev) =>
            prev.map((p) =>
              p.localId === item.localId
                ? { ...p, status: "uploaded", message: undefined }
                : p,
            ),
          );
        } catch {
          failCount += 1;
          setPending((prev) =>
            prev.map((p) =>
              p.localId === item.localId
                ? {
                    ...p,
                    status: "failed",
                    message: "Network error while uploading.",
                  }
                : p,
            ),
          );
        }
      }

      await reload();

      if (failCount === 0) {
        setSummary(
          `${successCount} image${successCount === 1 ? "" : "s"} uploaded successfully.`,
        );
        clearPending();
      } else {
        setSummary(
          `${successCount} uploaded successfully, ${failCount} failed.`,
        );
        setPending((prev) =>
          prev.filter((p) => p.status === "failed" || p.status === "invalid" || p.status === "duplicate"),
        );
      }
    } finally {
      setUploading(false);
      uploadLock.current = false;
    }
  }

  function update(id: string, patch: Partial<GalleryImage>) {
    setGallery((prev) =>
      prev.map((img) => (img.id === id ? { ...img, ...patch } : img)),
    );
  }

  function move(id: string, dir: -1 | 1) {
    setGallery((prev) => {
      const sorted = [...prev].sort((a, b) => a.displayOrder - b.displayOrder);
      const idx = sorted.findIndex((i) => i.id === id);
      const swap = idx + dir;
      if (idx < 0 || swap < 0 || swap >= sorted.length) return prev;
      const a = sorted[idx]!;
      const b = sorted[swap]!;
      const aOrder = a.displayOrder;
      sorted[idx] = { ...a, displayOrder: b.displayOrder };
      sorted[swap] = { ...b, displayOrder: aOrder };
      return sorted;
    });
  }

  async function onDelete(img: GalleryImage) {
    if (
      !confirm(
        "Delete this photo permanently? This removes it from the gallery and frees storage.",
      )
    ) {
      return;
    }
    setDeletingId(img.id);
    setError(null);
    try {
      const res = await fetch("/api/admin/gallery/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: img.id }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        gallery?: GalleryImage[];
        usage?: StorageUsage;
      };
      if (!res.ok) throw new Error(data.error || "Unable to delete photo.");
      if (data.gallery) {
        setGallery(
          [...data.gallery].sort((a, b) => a.displayOrder - b.displayOrder),
        );
      }
      if (data.usage) setUsage(data.usage);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to delete photo.");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <p className="text-sm text-warmgrey">Loading gallery…</p>;

  const storageFull = Boolean(usage && usage.remainingBytes <= 0);
  const storageAlmostFull = Boolean(usage && usage.percent >= 80 && !storageFull);
  const uploadProgress = pending.filter((p) =>
    ["waiting", "uploading", "uploaded", "failed"].includes(p.status),
  );
  const completedInBatch = uploadProgress.filter(
    (p) => p.status === "uploaded" || p.status === "failed",
  ).length;
  const totalInBatch = uploadProgress.length;
  const canStartUpload =
    !uploading &&
    !storageFull &&
    validPending.length > 0 &&
    !quotaBlockMessage;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-espresso">Gallery</h1>
        <p className="mt-2 text-sm text-warmgrey">
          Upload one or many photos, reorder, caption and hide them. Uploaded
          images use your gallery storage allowance. Bundled site images do not
          count toward it.
        </p>
        {error && (
          <p className="mt-2 whitespace-pre-line text-sm text-burgundy">
            {error}
          </p>
        )}
        {summary && <p className="mt-2 text-sm text-available">{summary}</p>}
      </div>

      {usage && (
        <div className="card-light space-y-3 p-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted">
                Gallery storage
              </p>
              <p className="mt-1 font-display text-2xl text-espresso">
                {usage.usedMb} MB / {usage.limitMb} MB used
              </p>
            </div>
            <p className="text-sm text-warmgrey">
              {usage.remainingMb} MB remaining
            </p>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-champagne">
            <div
              className={`h-full rounded-full transition-all ${
                storageFull
                  ? "bg-burgundy"
                  : storageAlmostFull
                    ? "bg-gold"
                    : "bg-available"
              }`}
              style={{ width: `${Math.min(100, usage.percent)}%` }}
            />
          </div>
          {storageAlmostFull && (
            <p className="text-sm text-espresso">
              Gallery storage is almost full.
            </p>
          )}
          {storageFull && (
            <p className="text-sm text-burgundy">
              Gallery storage is full. Delete images before uploading more.
            </p>
          )}
        </div>
      )}

      <div
        className={`card-light border-2 border-dashed p-5 transition ${
          dragOver ? "border-burgundy bg-blush/40" : "border-border"
        } ${uploading || storageFull ? "opacity-70" : ""}`}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!uploading && !storageFull) setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (uploading || storageFull) return;
          void addFiles(e.dataTransfer.files);
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-espresso">Upload Images</p>
            <p className="mt-1 text-sm text-warmgrey">
              Drag and drop multiple photos here, or choose files. JPEG, PNG,
              WebP or AVIF — max 8 MB each.
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary shrink-0"
            disabled={uploading || storageFull}
            onClick={() => inputRef.current?.click()}
          >
            Choose images
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            disabled={uploading || storageFull}
            onChange={(e) => {
              void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {pending.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-espresso">
                Selected:{" "}
                <span className="font-medium">
                  {pending.length} image{pending.length === 1 ? "" : "s"}
                </span>
              </p>
              <p className="text-sm text-warmgrey">
                Total selected size: {formatMb(selectedBytes)}
              </p>
              <p className="text-sm text-warmgrey">
                Ready to upload: {validPending.length} (
                {formatMb(readyBytes)})
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-ghost"
                disabled={uploading}
                onClick={clearPending}
              >
                Clear selection
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={!canStartUpload}
                onClick={() => void startUpload()}
              >
                {uploading
                  ? `Uploading ${Math.min(completedInBatch + 1, totalInBatch)} of ${totalInBatch}`
                  : `Upload ${validPending.length || ""} image${validPending.length === 1 ? "" : "s"}`.trim()}
              </button>
            </div>
          </div>

          {quotaBlockMessage && (
            <p className="whitespace-pre-line rounded-[14px] border border-burgundy/30 bg-blush/50 px-4 py-3 text-sm text-burgundy">
              {quotaBlockMessage}
            </p>
          )}

          {uploading && totalInBatch > 0 && (
            <p className="text-sm text-warmgrey">
              {completedInBatch} / {totalInBatch} complete
            </p>
          )}

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pending.map((item) => (
              <li key={item.localId} className="card-light overflow-hidden p-3">
                <div className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="size-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-espresso">
                      {item.file.name}
                    </p>
                    <p className="text-xs text-muted">{item.sizeLabel}</p>
                    <p
                      className={`mt-1 text-xs font-medium ${
                        item.status === "failed" ||
                        item.status === "invalid" ||
                        item.status === "duplicate"
                          ? "text-burgundy"
                          : item.status === "uploaded"
                            ? "text-available"
                            : "text-warmgrey"
                      }`}
                    >
                      {statusLabel(item.status)}
                    </p>
                    {item.message && (
                      <p className="mt-1 text-xs leading-snug text-burgundy">
                        {item.message}
                      </p>
                    )}
                  </div>
                </div>
                {!uploading && item.status !== "uploaded" && (
                  <button
                    type="button"
                    className="btn-ghost mt-2 px-0 text-sm"
                    onClick={() => removePending(item.localId)}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="space-y-4">
        {gallery.map((img) => (
          <li
            key={img.id}
            className="card-light grid gap-4 p-4 md:grid-cols-[8rem_1fr]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.alt}
              className="h-28 w-full rounded-xl object-cover"
            />
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium">Title</span>
                  <input
                    className="input-light"
                    value={img.title}
                    onChange={(e) => update(img.id, { title: e.target.value })}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium">Alt text</span>
                  <input
                    className="input-light"
                    value={img.alt}
                    onChange={(e) => update(img.id, { alt: e.target.value })}
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-3">
                <label className="text-sm">
                  <span className="mr-2 font-medium">Category</span>
                  <select
                    className="input-light w-auto"
                    value={img.category}
                    onChange={(e) =>
                      update(img.id, {
                        category: e.target.value as GalleryImage["category"],
                      })
                    }
                  >
                    {galleryCategories
                      .filter((c) => c !== "All")
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={img.featured}
                    onChange={(e) =>
                      update(img.id, { featured: e.target.checked })
                    }
                  />
                  Featured on homepage
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={img.enabled}
                    onChange={(e) =>
                      update(img.id, { enabled: e.target.checked })
                    }
                  />
                  Visible
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => move(img.id, -1)}
                >
                  Move up
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => move(img.id, 1)}
                >
                  Move down
                </button>
                <button
                  type="button"
                  className="btn-secondary text-burgundy"
                  disabled={deletingId === img.id || uploading}
                  onClick={() => void onDelete(img)}
                >
                  {deletingId === img.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <AdminSaveBar
        disabled={uploading}
        onSave={async () => {
          const normalized = gallery.map((img, index) => ({
            ...img,
            displayOrder: index + 1,
          }));
          await saveContentSection("gallery", normalized);
          setGallery(normalized);
        }}
      />
    </div>
  );
}
