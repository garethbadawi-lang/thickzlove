"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/data/site-config";

export function AdminAccountSetupForm({
  email,
  initialDisplayName,
}: {
  email: string;
  initialDisplayName: string;
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "complete_profile",
          displayName,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setError(data?.error || "Unable to save profile.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Unable to save profile.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-md card-light space-y-5 p-8"
    >
      <div className="text-center">
        <p className="font-script text-3xl text-burgundy">{siteConfig.name}</p>
        <h1 className="mt-3 font-display text-2xl text-espresso">
          Welcome — finish setup
        </h1>
        <p className="mt-2 text-sm text-warmgrey">
          Confirm how your name should appear in the admin. You sign in with
          your email address.
        </p>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-espresso">Email</span>
        <input className="input-light bg-champagne/40" value={email} readOnly />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-espresso">
          Display name
        </span>
        <input
          className="input-light"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          minLength={2}
          maxLength={80}
          autoComplete="name"
        />
      </label>

      {error && <p className="text-sm text-burgundy">{error}</p>}

      <button type="submit" className="btn-primary w-full" disabled={busy}>
        {busy ? "Saving…" : "Continue to admin"}
      </button>
    </form>
  );
}
