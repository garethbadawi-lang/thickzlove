"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminSaveBar,
  saveContentSection,
} from "@/components/admin/AdminSaveBar";
import type { SiteContent } from "@/lib/site-content-types";

type HomepageContent = SiteContent["homepage"];

export function AdminHomepageEditor() {
  const router = useRouter();
  const [homepage, setHomepage] = useState<HomepageContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/content");
        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }
        if (!res.ok) throw new Error("Unable to load homepage content.");
        const data = (await res.json()) as { content: SiteContent };
        setHomepage(data.content.homepage);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load.");
      }
    })();
  }, [router]);

  if (!homepage) {
    return (
      <p className="text-sm text-warmgrey">
        {error || "Loading homepage…"}
      </p>
    );
  }

  function set<K extends keyof HomepageContent>(key: K, value: HomepageContent[K]) {
    setHomepage((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-espresso">Homepage</h1>
        <p className="mt-2 text-sm text-warmgrey">
          Edit the public homepage wording only — not layout or colours.
        </p>
        {error && <p className="mt-2 text-sm text-burgundy">{error}</p>}
      </div>

      <div className="card-light space-y-4 p-5">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={homepage.announcementEnabled}
            onChange={(e) => set("announcementEnabled", e.target.checked)}
          />
          Show announcement bar
        </label>
        <Field
          label="Announcement text"
          value={homepage.announcementText}
          onChange={(v) => set("announcementText", v)}
        />
        <Field label="Tagline" value={homepage.tagline} onChange={(v) => set("tagline", v)} />
        <Field
          label="Hero heading"
          value={homepage.heroHeading}
          onChange={(v) => set("heroHeading", v)}
        />
        <Field
          label="Hero script line"
          value={homepage.heroScript}
          onChange={(v) => set("heroScript", v)}
        />
        <Area
          label="Hero description"
          value={homepage.heroDescription}
          onChange={(v) => set("heroDescription", v)}
        />
        <Field
          label="Primary button label"
          value={homepage.mainCtaLabel}
          onChange={(v) => set("mainCtaLabel", v)}
        />
        <Field
          label="Primary button link"
          value={homepage.mainCtaHref}
          onChange={(v) => set("mainCtaHref", v)}
        />
        <Field
          label="Secondary button label"
          value={homepage.secondaryCtaLabel}
          onChange={(v) => set("secondaryCtaLabel", v)}
        />
        <Field
          label="Secondary button link"
          value={homepage.secondaryCtaHref}
          onChange={(v) => set("secondaryCtaHref", v)}
        />
        <Field
          label="Intro heading"
          value={homepage.introHeading}
          onChange={(v) => set("introHeading", v)}
        />
        <Area
          label="Intro text"
          value={homepage.introText}
          onChange={(v) => set("introText", v)}
        />
      </div>

      <AdminSaveBar
        onSave={async () => {
          await saveContentSection("homepage", homepage);
        }}
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <input
        className="input-light"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <textarea
        className="input-light min-h-28"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
