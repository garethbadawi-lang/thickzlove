"use client";

import { useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/data/site-config";
import { getEnabledSocials } from "@/data/socials";
import { externalRel } from "@/lib/utils";

export function ContactPanel() {
  const socials = getEnabledSocials();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          ageConfirmed,
          website,
          enquiryType: "general",
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setStatus("error");
        setError(data.error || "Unable to send message.");
        return;
      }
      setStatus("ok");
      setName("");
      setEmail("");
      setMessage("");
      setAgeConfirmed(false);
    } catch {
      setStatus("error");
      setError("Unable to send message.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <h2 className="font-display text-3xl text-espresso">Official channels</h2>
        <p className="mt-3 text-sm leading-relaxed text-warmgrey">
          {siteConfig.contact.responseTime}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-warmgrey">
          {siteConfig.contact.privacyNote}
        </p>

        <div className="mt-8 space-y-4">
          <Link href="/booking" className="btn-primary inline-flex">
            Request a Booking
          </Link>
          {socials.length > 0 ? (
            <ul className="space-y-2">
              {socials.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel={externalRel()}
                    className="text-sm font-medium text-burgundy hover:underline"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-warmgrey">
              Official social links will appear here once confirmed.
            </p>
          )}
        </div>

        <aside className="mt-10 rounded-[18px] border border-border bg-blush/40 p-5">
          <p className="text-sm font-semibold text-espresso">Impersonator warning</p>
          <p className="mt-2 text-sm leading-relaxed text-warmgrey">
            Only trust contact methods listed on this website. Do not send
            payments or personal documents to accounts claiming to be Miss Juicy
            Staxxx without written confirmation through an official channel.
          </p>
        </aside>
      </div>

      <form onSubmit={onSubmit} className="card-light space-y-4 p-6">
        <h2 className="font-display text-2xl text-espresso">General enquiry</h2>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Name</span>
          <input
            className="input-light"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Email</span>
          <input
            type="email"
            className="input-light"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Message</span>
          <textarea
            className="input-light min-h-32"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </label>
        <label className="flex items-start gap-3 text-sm text-warmgrey">
          <input
            type="checkbox"
            className="mt-1 size-4 accent-burgundy"
            checked={ageConfirmed}
            onChange={(e) => setAgeConfirmed(e.target.checked)}
            required
          />
          <span>I confirm I meet the minimum legal age in my location.</span>
        </label>
        <input
          className="hidden"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
        />
        {status === "ok" && (
          <p className="text-sm text-available">{siteConfig.contact.successMessage}</p>
        )}
        {error && <p className="text-sm text-burgundy">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? "Sending…" : "Send Message"}
        </button>
      </form>
    </div>
  );
}
