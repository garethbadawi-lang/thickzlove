"use client";

import { useState } from "react";

export function AdminSaveBar({
  onSave,
  disabled,
}: {
  onSave: () => Promise<void>;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      await onSave();
      setMessage("Saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
      <button
        type="button"
        className="btn-primary"
        onClick={() => void handleSave()}
        disabled={busy || disabled}
      >
        {busy ? "Saving…" : "Save Changes"}
      </button>
      {message && <p className="text-sm text-available">{message}</p>}
      {error && <p className="text-sm text-burgundy">{error}</p>}
    </div>
  );
}

export async function saveContentSection(
  section: string,
  value: unknown,
): Promise<void> {
  const res = await fetch("/api/admin/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ section, value }),
  });
  if (res.status === 401) {
    throw new Error("Please sign in again.");
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "Unable to save.");
  }
}
