"use client";

import { useState } from "react";

export function AdminInviteClientForm() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          displayName: displayName || undefined,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;
      if (!res.ok) {
        setError(data?.error || "Unable to send invitation.");
        return;
      }
      setMessage(data?.message || "Invitation sent.");
      setEmail("");
      setDisplayName("");
    } catch {
      setError("Unable to send invitation.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card-light max-w-lg space-y-4 p-5">
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Client email</span>
        <input
          type="email"
          className="input-light"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="off"
          placeholder="her@real-email.com"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium">
          Display name (optional)
        </span>
        <input
          className="input-light"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={80}
          placeholder="Love Z Thick"
        />
      </label>
      {error && <p className="text-sm text-burgundy">{error}</p>}
      {message && <p className="text-sm text-available">{message}</p>}
      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? "Sending…" : "Send invitation"}
      </button>
    </form>
  );
}
