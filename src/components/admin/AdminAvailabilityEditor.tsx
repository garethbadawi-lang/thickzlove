"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminSaveBar,
  saveContentSection,
} from "@/components/admin/AdminSaveBar";
import type { AvailabilityOverrideStatus } from "@/lib/site-content-types";

function monthDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const count = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ date: string | null; day: number | null }> = [];
  for (let i = 0; i < startPad; i++) cells.push({ date: null, day: null });
  for (let d = 1; d <= count; d++) {
    const iso = new Date(year, month, d).toISOString().slice(0, 10);
    cells.push({ date: iso, day: d });
  }
  return cells;
}

export function AdminAvailabilityEditor() {
  const router = useRouter();
  const [overrides, setOverrides] = useState<
    Record<string, AvailabilityOverrideStatus>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/content");
        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }
        if (!res.ok) throw new Error("Unable to load availability.");
        const data = (await res.json()) as {
          content: { availabilityOverrides: Record<string, AvailabilityOverrideStatus> };
        };
        setOverrides(data.content.availabilityOverrides || {});
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const cells = useMemo(
    () => monthDays(cursor.year, cursor.month),
    [cursor.year, cursor.month],
  );

  const label = new Date(cursor.year, cursor.month, 1).toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
  });

  function cycle(date: string) {
    setOverrides((prev) => {
      const current = prev[date];
      const next = { ...prev };
      if (!current) next[date] = "available";
      else if (current === "available") next[date] = "unavailable";
      else delete next[date];
      return next;
    });
  }

  if (loading) {
    return <p className="text-sm text-warmgrey">Loading availability…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-espresso">Availability</h1>
        <p className="mt-2 text-sm text-warmgrey">
          Tap a date to cycle: Default → Available → Unavailable. Default
          keeps the built-in schedule. Available / Unavailable override it
          on the public calendar immediately after you save.
        </p>
        {error && <p className="mt-2 text-sm text-burgundy">{error}</p>}
      </div>

      <div className="card-light p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              setCursor((c) => {
                const d = new Date(c.year, c.month - 1, 1);
                return { year: d.getFullYear(), month: d.getMonth() };
              })
            }
          >
            Previous
          </button>
          <p className="font-display text-xl text-espresso">{label}</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              setCursor((c) => {
                const d = new Date(c.year, c.month + 1, 1);
                return { year: d.getFullYear(), month: d.getMonth() };
              })
            }
          >
            Next
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.12em] text-muted">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-2">
          {cells.map((cell, idx) => {
            if (!cell.date) return <div key={`pad-${idx}`} />;
            const status = overrides[cell.date];
            return (
              <button
                key={cell.date}
                type="button"
                onClick={() => cycle(cell.date!)}
                className={`min-h-16 rounded-xl border px-1 py-2 text-sm transition ${
                  status === "available"
                    ? "border-available bg-white text-available"
                    : status === "unavailable"
                      ? "border-burgundy/40 bg-blush/50 text-burgundy"
                      : "border-border bg-champagne/40 text-espresso"
                }`}
              >
                <span className="block font-medium">{cell.day}</span>
                <span className="mt-1 block text-[10px] uppercase tracking-[0.08em]">
                  {status === "available"
                    ? "Open"
                    : status === "unavailable"
                      ? "Closed"
                      : "—"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <AdminSaveBar
        onSave={async () => {
          await saveContentSection("availabilityOverrides", overrides);
        }}
      />
    </div>
  );
}
