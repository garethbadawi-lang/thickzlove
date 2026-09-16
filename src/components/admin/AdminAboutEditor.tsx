"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminSaveBar,
  saveContentSection,
} from "@/components/admin/AdminSaveBar";
import type { SiteContent } from "@/lib/site-content-types";

type AboutContent = SiteContent["about"];

export function AdminAboutEditor() {
  const router = useRouter();
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/content");
        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }
        if (!res.ok) throw new Error("Unable to load about content.");
        const data = (await res.json()) as { content: SiteContent };
        setAbout(data.content.about);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load.");
      }
    })();
  }, [router]);

  if (!about) {
    return <p className="text-sm text-warmgrey">{error || "Loading about…"}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-espresso">About</h1>
        <p className="mt-2 text-sm text-warmgrey">
          Update the public biography and about-page details.
        </p>
      </div>

      <div className="card-light space-y-4 p-5">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Heading</span>
          <input
            className="input-light"
            value={about.heading}
            onChange={(e) => setAbout({ ...about, heading: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Subtitle</span>
          <input
            className="input-light"
            value={about.scriptSubtitle}
            onChange={(e) =>
              setAbout({ ...about, scriptSubtitle: e.target.value })
            }
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Biography</span>
          <textarea
            className="input-light min-h-40"
            value={about.paragraphs.join("\n\n")}
            onChange={(e) =>
              setAbout({
                ...about,
                paragraphs: e.target.value
                  .split(/\n\s*\n/)
                  .map((p) => p.trim())
                  .filter(Boolean),
              })
            }
          />
          <span className="mt-1 block text-xs text-muted">
            Separate paragraphs with a blank line.
          </span>
        </label>
        {(
          [
            ["personality", "Personality"],
            ["idealArrangements", "Ideal arrangements"],
            ["favouriteSettings", "Favourite settings"],
            ["interests", "Interests"],
            ["dressStyle", "Dress style"],
            ["travelPreferences", "Travel preferences"],
            ["languages", "Languages"],
            ["generalAvailability", "General availability"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-sm">
            <span className="mb-1 block font-medium">{label}</span>
            <textarea
              className="input-light min-h-20"
              value={about[key]}
              onChange={(e) => setAbout({ ...about, [key]: e.target.value })}
            />
          </label>
        ))}
      </div>

      <AdminSaveBar
        onSave={async () => {
          await saveContentSection("about", about);
        }}
      />
    </div>
  );
}
