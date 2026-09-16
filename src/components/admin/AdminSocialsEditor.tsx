"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminSaveBar,
  saveContentSection,
} from "@/components/admin/AdminSaveBar";
import type { SocialLink } from "@/data/socials";
import {
  SOCIAL_PLATFORM_OPTIONS,
  createEmptySocialLink,
  normalizeSocialLinks,
  validateSocialLinks,
} from "@/lib/social-links";

export function AdminSocialsEditor() {
  const router = useRouter();
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/content");
        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }
        if (!res.ok) throw new Error("Unable to load social links.");
        const data = (await res.json()) as { content: { socials: SocialLink[] } };
        setSocials(normalizeSocialLinks(data.content.socials || []));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  function updateAt(index: number, patch: Partial<SocialLink>) {
    setSocials((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    );
  }

  function move(index: number, direction: -1 | 1) {
    setSocials((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      const tmp = next[index]!;
      next[index] = next[target]!;
      next[target] = tmp;
      return next;
    });
  }

  function removeAt(index: number) {
    const item = socials[index];
    if (!item) return;
    const ok = window.confirm(
      `Remove “${item.label || "this link"}” from the site? This cannot be undone after you save.`,
    );
    if (!ok) return;
    setSocials((prev) => prev.filter((_, i) => i !== index));
  }

  function addLink() {
    setSocials((prev) => [...prev, createEmptySocialLink()]);
  }

  function platformValue(icon: string) {
    const match = SOCIAL_PLATFORM_OPTIONS.find((p) => p.icon === icon);
    return match?.id ?? "custom";
  }

  function onPlatformChange(index: number, platformId: string) {
    const platform =
      SOCIAL_PLATFORM_OPTIONS.find((p) => p.id === platformId) ||
      SOCIAL_PLATFORM_OPTIONS.find((p) => p.id === "custom")!;
    updateAt(index, { icon: platform.icon });
  }

  if (loading) return <p className="text-sm text-warmgrey">Loading socials…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-espresso">Social Links</h1>
          <p className="mt-2 max-w-xl text-sm text-warmgrey">
            Manage the public social and content tiles. Add new platforms, hide
            ones you are not using, or reorder how they appear. The developer
            credit in the footer is separate and not editable here.
          </p>
          {error && <p className="mt-2 text-sm text-burgundy">{error}</p>}
        </div>
        <button type="button" className="btn-secondary shrink-0" onClick={addLink}>
          + Add Social Link
        </button>
      </div>

      <ul className="space-y-4">
        {socials.map((item, index) => (
          <li key={item.id} className="card-light space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-espresso">
                {item.label.trim() || "New social link"}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="btn-ghost px-2 text-sm"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                >
                  Move up
                </button>
                <button
                  type="button"
                  className="btn-ghost px-2 text-sm"
                  onClick={() => move(index, 1)}
                  disabled={index === socials.length - 1}
                >
                  Move down
                </button>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={(e) =>
                      updateAt(index, { enabled: e.target.checked })
                    }
                  />
                  Visible
                </label>
                <button
                  type="button"
                  className="btn-ghost px-2 text-sm text-burgundy"
                  onClick={() => removeAt(index)}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Display label</span>
                <input
                  className="input-light"
                  value={item.label}
                  onChange={(e) => updateAt(index, { label: e.target.value })}
                  placeholder="e.g. Instagram"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Icon / platform</span>
                <select
                  className="input-light"
                  value={platformValue(item.icon)}
                  onChange={(e) => onPlatformChange(index, e.target.value)}
                >
                  {SOCIAL_PLATFORM_OPTIONS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-sm">
              <span className="mb-1 block font-medium">URL</span>
              <input
                className="input-light"
                value={item.url}
                onChange={(e) => updateAt(index, { url: e.target.value })}
                placeholder="https://"
                inputMode="url"
                autoComplete="url"
              />
            </label>
          </li>
        ))}
      </ul>

      {socials.length === 0 && (
        <p className="text-sm text-warmgrey">
          No social links yet. Use “+ Add Social Link” to create one.
        </p>
      )}

      <AdminSaveBar
        onSave={async () => {
          const normalised = normalizeSocialLinks(socials);
          const validationError = validateSocialLinks(normalised);
          if (validationError) throw new Error(validationError);
          await saveContentSection("socials", normalised);
          setSocials(normalised);
        }}
      />
    </div>
  );
}
