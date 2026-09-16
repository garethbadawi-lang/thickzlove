"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminSaveBar,
  saveContentSection,
} from "@/components/admin/AdminSaveBar";
import type { GalleryImage } from "@/data/gallery";
import { galleryCategories } from "@/data/gallery";

export function AdminGalleryEditor() {
  const router = useRouter();
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function reload() {
    const res = await fetch("/api/admin/content");
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    if (!res.ok) throw new Error("Unable to load gallery.");
    const data = (await res.json()) as { content: { gallery: GalleryImage[] } };
    setGallery(
      [...(data.content.gallery || [])].sort(
        (a, b) => a.displayOrder - b.displayOrder,
      ),
    );
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

  async function onUpload(fileList: FileList | null) {
    if (!fileList?.[0]) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("file", fileList[0]);
      const res = await fetch("/api/admin/gallery/upload", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Upload failed.");
      }
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <p className="text-sm text-warmgrey">Loading gallery…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-espresso">Gallery</h1>
        <p className="mt-2 text-sm text-warmgrey">
          Upload, reorder, caption and hide photos. Changes appear on the public
          gallery after you save.
        </p>
        {error && <p className="mt-2 text-sm text-burgundy">{error}</p>}
      </div>

      <label className="btn-secondary inline-flex cursor-pointer">
        {uploading ? "Uploading…" : "Upload photo"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={(e) => void onUpload(e.target.files)}
        />
      </label>

      <ul className="space-y-4">
        {gallery.map((img) => (
          <li key={img.id} className="card-light grid gap-4 p-4 md:grid-cols-[8rem_1fr]">
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
                  className="btn-secondary"
                  onClick={() => {
                    if (
                      confirm(
                        "Remove this photo from the gallery list? (Uploaded files are not deleted from storage.)",
                      )
                    ) {
                      setGallery((prev) => prev.filter((g) => g.id !== img.id));
                    }
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <AdminSaveBar
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
