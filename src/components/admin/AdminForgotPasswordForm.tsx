"use client";

import { useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/data/site-config";

export function AdminForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => null)) as {
        message?: string;
      } | null;
      setMessage(
        data?.message ||
          "If an account exists for that email, we've sent password reset instructions.",
      );
    } catch {
      setMessage(
        "If an account exists for that email, we've sent password reset instructions.",
      );
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
          Forgot password
        </h1>
        <p className="mt-2 text-sm text-warmgrey">
          Enter your login email. We&apos;ll send reset instructions if an
          account exists.
        </p>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-espresso">Email</span>
        <input
          type="email"
          className="input-light"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </label>

      {message && <p className="text-sm text-warmgrey">{message}</p>}

      <button type="submit" className="btn-primary w-full" disabled={busy}>
        {busy ? "Sending…" : "Send reset link"}
      </button>

      <p className="text-center text-sm">
        <Link href="/admin/login" className="text-burgundy hover:underline">
          Back to login
        </Link>
      </p>
    </form>
  );
}
