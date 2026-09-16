"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/data/site-config";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
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
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          setError("Too many attempts. Please try again later.");
        } else {
          setError("Invalid username or password.");
        }
        return;
      }

      setPassword("");
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Invalid username or password.");
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
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-espresso">Username</span>
        <input
          type="text"
          name="username"
          className="input-light"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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

      {error && <p className="text-sm text-burgundy">{error}</p>}

      <button type="submit" className="btn-primary w-full" disabled={busy}>
        {busy ? "Signing in…" : "Log In"}
      </button>
    </form>
  );
}
