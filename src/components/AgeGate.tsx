"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/data/site-config";

export function AgeGate() {
  const [ready, setReady] = useState(false);
  const [confirmed, setConfirmed] = useState(true);
  const { ageGate } = siteConfig;

  useEffect(() => {
    if (!ageGate.enabled) {
      setReady(true);
      return;
    }
    const stored = localStorage.getItem(ageGate.storageKey);
    setConfirmed(stored === "true");
    setReady(true);
  }, [ageGate.enabled, ageGate.storageKey]);

  function confirm() {
    localStorage.setItem(ageGate.storageKey, "true");
    setConfirmed(true);
  }

  function exit() {
    window.location.href = ageGate.exitUrl;
  }

  if (!ready || !ageGate.enabled || confirmed) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      aria-describedby="age-gate-desc"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-espresso/50 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md rounded-[18px] border border-border bg-white p-8 text-center shadow-soft">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full border border-border bg-blush/50">
          <span className="font-display text-lg tracking-[0.12em] text-burgundy">
            {siteConfig.monogram}
          </span>
        </div>

        <p className="text-eyebrow mb-3">{ageGate.eyebrow}</p>
        <h1
          id="age-gate-title"
          className="font-display text-3xl leading-tight text-espresso text-balance sm:text-4xl"
        >
          {ageGate.title}
        </h1>
        <p
          id="age-gate-desc"
          className="mt-4 text-sm leading-relaxed text-warmgrey"
        >
          {ageGate.message}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-warmgrey/90">
          {ageGate.disclaimer}
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={confirm}
            autoFocus
            className="btn-primary min-h-12 w-full"
          >
            {ageGate.confirmLabel}
          </button>
          <button
            type="button"
            onClick={exit}
            className="btn-secondary min-h-12 w-full"
          >
            {ageGate.exitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
