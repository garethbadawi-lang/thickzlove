"use client";

import { useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/data/site-config";

export function AdminBootstrapSetupForm({
  initialEmail,
  initialDisplayName,
  emailAlreadySubmitted,
}: {
  initialEmail: string;
  initialDisplayName: string;
  emailAlreadySubmitted: boolean;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(
    emailAlreadySubmitted
      ? "We already sent a setup email. Check your inbox (and spam), or resend below."
      : null,
  );
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(emailAlreadySubmitted);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: submitted ? "resend_email" : "submit_email",
          email,
          displayName,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
        message?: string;
        email?: string;
      } | null;
      if (!res.ok) {
        setError(data?.error || "Unable to continue setup.");
        return;
      }
      setSubmitted(true);
      setMessage(
        data?.message ||
          "Check your email for a link to verify your address and choose your password.",
      );
    } catch {
      setError("Unable to continue setup.");
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
          Secure your account
        </h1>
        <p className="mt-2 text-sm text-warmgrey">
          You signed in with a temporary starter login. Add your email and
          display name so we can send a verification link. You&apos;ll choose
          your own permanent password — then you&apos;ll sign in with email
          going forward.
        </p>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-espresso">
          Email address
        </span>
        <input
          type="email"
          className="input-light"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
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
      {message && !error && (
        <p className="text-sm text-warmgrey">{message}</p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={busy}>
        {busy
          ? "Sending…"
          : submitted
            ? "Resend setup email"
            : "Send verification email"}
      </button>

      {submitted && (
        <p className="text-center text-sm text-warmgrey">
          After you set your password,{" "}
          <Link href="/admin/login" className="text-burgundy hover:underline">
            sign in with your email
          </Link>
          . Your starter username stays available until that succeeds.
        </p>
      )}
    </form>
  );
}
