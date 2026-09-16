"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/data/site-config";

export function AdminResetPasswordForm({
  token,
  error,
}: {
  token: string;
  error: string | null;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(
    error ? "This reset link is invalid or expired. Request a new one." : null,
  );
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setMessage("Missing reset token. Use the link from your email.");
      return;
    }
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          newPassword: password,
          token,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          message?: string;
          error?: string;
        } | null;
        setMessage(
          data?.message ||
            data?.error ||
            "Unable to reset password. Request a new link.",
        );
        return;
      }

      // Audit via dedicated endpoint without exposing token
      await fetch("/api/admin/password-changed", {
        method: "POST",
        credentials: "include",
      }).catch(() => null);

      setMessage("Password updated. You can sign in now.");
      setTimeout(() => {
        router.replace("/admin/login");
        router.refresh();
      }, 800);
    } catch {
      setMessage("Unable to reset password. Request a new link.");
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
          Choose a new password
        </h1>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-espresso">
          New password
        </span>
        <input
          type="password"
          className="input-light"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-espresso">
          Confirm password
        </span>
        <input
          type="password"
          className="input-light"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
      </label>

      {message && <p className="text-sm text-burgundy">{message}</p>}

      <button
        type="submit"
        className="btn-primary w-full"
        disabled={busy || !token}
      >
        {busy ? "Saving…" : "Save password"}
      </button>

      <p className="text-center text-sm">
        <Link
          href="/admin/forgot-password"
          className="text-burgundy hover:underline"
        >
          Request a new reset link
        </Link>
      </p>
    </form>
  );
}
