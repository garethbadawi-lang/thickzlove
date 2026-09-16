"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminSaveBar,
  saveContentSection,
} from "@/components/admin/AdminSaveBar";
import type { SiteContent } from "@/lib/site-content-types";

type SettingsContent = SiteContent["settings"];

export function AdminSettingsEditor() {
  const router = useRouter();
  const [settings, setSettings] = useState<SettingsContent | null>(null);
  const [contactEmail, setContactEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/content");
        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }
        if (!res.ok) throw new Error("Unable to load settings.");
        const data = (await res.json()) as { content: SiteContent };
        setSettings(data.content.settings);

        const siteRes = await fetch("/api/admin/site");
        if (siteRes.ok) {
          const site = (await siteRes.json()) as {
            contactEmail?: string | null;
          };
          setContactEmail(site.contactEmail || "");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load.");
      }
    })();
  }, [router]);

  if (!settings) {
    return (
      <p className="text-sm text-warmgrey">{error || "Loading settings…"}</p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-espresso">Site Settings</h1>
        <p className="mt-2 text-sm text-warmgrey">
          Safe public business wording only. Passwords, storage tokens and
          developer credit are not editable here.
        </p>
      </div>

      <div className="card-light space-y-4 p-5">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">
            Business contact email (Neon)
          </span>
          <input
            className="input-light"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="Add when you have her public email"
            autoComplete="off"
          />
          <span className="mt-1 block text-xs text-warmgrey">
            Stored on the Thick Z Love site record — separate from developer
            email and login accounts.
          </span>
        </label>
      </div>

      <div className="card-light space-y-4 p-5">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Location label</span>
          <input
            className="input-light"
            value={settings.location}
            onChange={(e) =>
              setSettings({ ...settings, location: e.target.value })
            }
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Footer message</span>
          <textarea
            className="input-light min-h-24"
            value={settings.footerMessage}
            onChange={(e) =>
              setSettings({ ...settings, footerMessage: e.target.value })
            }
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Contact response time</span>
          <input
            className="input-light"
            value={settings.responseTime}
            onChange={(e) =>
              setSettings({ ...settings, responseTime: e.target.value })
            }
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Contact success message</span>
          <textarea
            className="input-light min-h-24"
            value={settings.contactSuccessMessage}
            onChange={(e) =>
              setSettings({
                ...settings,
                contactSuccessMessage: e.target.value,
              })
            }
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Contact privacy note</span>
          <textarea
            className="input-light min-h-20"
            value={settings.contactPrivacyNote}
            onChange={(e) =>
              setSettings({
                ...settings,
                contactPrivacyNote: e.target.value,
              })
            }
          />
        </label>
      </div>

      <AdminSaveBar
        onSave={async () => {
          await saveContentSection("settings", settings);
          const siteRes = await fetch("/api/admin/site", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contactEmail: contactEmail.trim() || null,
            }),
          });
          if (!siteRes.ok) {
            const data = (await siteRes.json().catch(() => null)) as {
              error?: string;
            } | null;
            throw new Error(data?.error || "Unable to save business email.");
          }
        }}
      />
    </div>
  );
}
