"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminAccountPanel({
  mode,
  email,
  displayName: initialName,
}: {
  mode: "neon" | "bootstrap";
  email: string | null;
  displayName: string;
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function saveDisplayName(e: React.FormEvent) {
    e.preventDefault();
    if (mode !== "neon") return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "update_display_name", displayName }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setError(data?.error || "Unable to update display name.");
        return;
      }
      setMessage("Display name saved.");
      router.refresh();
    } catch {
      setError("Unable to update display name.");
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (mode !== "neon") return;
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "change_password",
          currentPassword,
          newPassword,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setError(data?.error || "Unable to change password.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password updated.");
    } catch {
      setError("Unable to change password.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE", credentials: "include" });
    router.replace("/admin/login");
    router.refresh();
  }

  if (mode === "bootstrap") {
    return (
      <div className="card-light space-y-4 p-5">
        <p className="text-sm text-warmgrey">
          You are on the temporary starter login. Finish account setup to switch
          to your permanent email and password.
        </p>
        <button type="button" className="btn-secondary" onClick={() => void logout()}>
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card-light space-y-4 p-5">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Email (login)</span>
          <input className="input-light bg-champagne/40" value={email || ""} readOnly />
          <span className="mt-1 block text-xs text-warmgrey">
            Email changes are not enabled yet in Neon Auth for this project.
            Contact your developer if the address needs updating.
          </span>
        </label>
      </div>

      <form onSubmit={saveDisplayName} className="card-light space-y-4 p-5">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Display name</span>
          <input
            className="input-light"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            minLength={2}
            maxLength={80}
          />
        </label>
        <button type="submit" className="btn-primary" disabled={busy}>
          Save display name
        </button>
      </form>

      <form onSubmit={changePassword} className="card-light space-y-4 p-5">
        <h2 className="font-display text-xl text-espresso">Change password</h2>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Current password</span>
          <input
            type="password"
            className="input-light"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">New password</span>
          <input
            type="password"
            className="input-light"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Confirm new password</span>
          <input
            type="password"
            className="input-light"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        <button type="submit" className="btn-primary" disabled={busy}>
          Update password
        </button>
      </form>

      {(message || error) && (
        <p className={`text-sm ${error ? "text-burgundy" : "text-available"}`}>
          {error || message}
        </p>
      )}

      <button type="button" className="btn-secondary" onClick={() => void logout()}>
        Log out
      </button>
    </div>
  );
}
