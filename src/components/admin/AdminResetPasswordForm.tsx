"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/data/site-config";

/**
 * Password change is bound to the Neon Auth reset token from the email link.
 * Never accepts email / userId from the browser to select an account.
 */
export function AdminResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) {
      setMessage("Invalid or expired password reset link.");
      return;
    }
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
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
        // Never surface raw tokens; keep messaging generic for auth failures.
        setMessage(
          data?.message ||
            data?.error ||
            "Invalid or expired password reset link. Request a new reset link to continue.",
        );
        return;
      }

      await fetch("/api/admin/password-changed", {
        method: "POST",
        credentials: "include",
      }).catch(() => null);

      setDone(true);
      setPassword("");
      setConfirm("");
      setMessage("Password updated. You can sign in now.");
      setTimeout(() => {
        router.replace("/admin/login");
        router.refresh();
      }, 900);
    } catch {
      setMessage(
        "Unable to reset password. Request a new reset link to continue.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-md card-light space-y-5 p-8"
      autoComplete="off"
    >
      <div className="text-center">
        <p className="font-script text-3xl text-burgundy">{siteConfig.name}</p>
        <h1 className="mt-3 font-display text-2xl text-espresso">
          Choose a new password
        </h1>
        <p className="mt-2 text-sm text-warmgrey">
          Your account is confirmed by the secure link from your email.
        </p>
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
          disabled={busy || done}
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
          disabled={busy || done}
        />
      </label>

      {message && <p className="text-sm text-burgundy">{message}</p>}

      <button
        type="submit"
        className="btn-primary w-full"
        disabled={busy || done || !token.trim()}
      >
        {busy ? "Saving…" : done ? "Saved" : "Save password"}
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
