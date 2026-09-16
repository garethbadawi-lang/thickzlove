"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/data/site-config";

export function AdminLoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: identifier, password }),
      });

      const data = (await res.json().catch(() => null)) as {
        error?: string;
        mode?: string;
        requiresSetup?: boolean;
      } | null;

      if (!res.ok) {
        if (res.status === 429) {
          setError("Too many attempts. Please try again later.");
        } else {
          setError(data?.error || "Invalid email or password.");
        }
        return;
      }

      setPassword("");
      if (data?.requiresSetup || data?.mode === "bootstrap") {
        router.replace("/admin/account/setup");
      } else {
        router.replace("/admin");
      }
      router.refresh();
    } catch {
      setError("Invalid email or password.");
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
        <h1 className="mt-3 font-display text-2xl text-espresso">Admin Login</h1>
        <p className="mt-2 text-sm text-warmgrey">
          Use your email and password, or the temporary starter username if you
          haven&apos;t finished account setup yet.
        </p>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-espresso">
          Email or username
        </span>
        <input
          type="text"
          name="email"
          inputMode="email"
          className="input-light"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          autoComplete="username"
          required
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-espresso">Password</span>
        <input
          type="password"
          name="password"
          className="input-light"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </label>

      <div className="text-right">
        <Link
          href="/admin/forgot-password"
          className="text-sm text-burgundy underline-offset-2 hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      {error && <p className="text-sm text-burgundy">{error}</p>}

      <button type="submit" className="btn-primary w-full" disabled={busy}>
        {busy ? "Signing in…" : "Log In"}
      </button>
    </form>
  );
}
