"use client";

import { useEffect, useMemo, useState } from "react";
import type { BookingEnquiry } from "@/lib/booking-types";

const enquiryStatuses = [
  "New",
  "Under review",
  "Awaiting information",
  "Screening required",
  "Awaiting verification",
  "Approved",
  "Declined",
  "Confirmed",
  "Completed",
  "Cancelled",
] as const;

const verificationStatuses = [
  "Not requested",
  "Verification requested",
  "Verification in progress",
  "Verified",
  "Rejected",
  "Expired",
] as const;

const depositStatuses = [
  "Not requested",
  "Awaiting deposit",
  "Received",
  "Refunded",
  "Waived",
] as const;

export function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [bookings, setBookings] = useState<BookingEnquiry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selected = useMemo(
    () => bookings.find((b) => b.id === selectedId) || null,
    [bookings, selectedId],
  );

  async function load() {
    const res = await fetch("/api/admin/bookings");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const data = (await res.json()) as { bookings: BookingEnquiry[] };
    setBookings(data.bookings || []);
    setAuthed(true);
  }

  useEffect(() => {
    void load();
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Invalid credentials.");
        return;
      }
      setPassword("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
    setBookings([]);
    setSelectedId(null);
  }

  async function savePatch(patch: Partial<BookingEnquiry>) {
    if (!selected) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, ...patch }),
      });
      if (!res.ok) {
        setError("Unable to update booking.");
        return;
      }
      const data = (await res.json()) as { booking: BookingEnquiry };
      setBookings((prev) =>
        prev.map((b) => (b.id === data.booking.id ? data.booking : b)),
      );
    } finally {
      setBusy(false);
    }
  }

  async function removeSelected() {
    if (!selected) return;
    if (!confirm("Delete this enquiry and personal data permanently?")) return;
    const res = await fetch(`/api/admin/bookings?id=${selected.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("Unable to delete.");
      return;
    }
    setBookings((prev) => prev.filter((b) => b.id !== selected.id));
    setSelectedId(null);
  }

  function exportSelected() {
    if (!selected) return;
    const safe = {
      referenceNumber: selected.referenceNumber,
      clientName: selected.preferredName || selected.fullName,
      email: selected.email,
      phone: selected.mobile,
      service: selected.serviceName,
      requestedDate: selected.preferredDate,
      alternativeDate: selected.alternativeDate,
      timeWindow: selected.timeWindow,
      duration: selected.requestedDuration,
      city: selected.city,
      venueType: selected.venueType,
      notes: selected.additionalNotes,
      verificationStatus: selected.verificationStatus,
      enquiryStatus: selected.enquiryStatus,
      depositStatus: selected.depositStatus,
      createdAt: selected.createdAt,
      updatedAt: selected.updatedAt,
    };
    const blob = new Blob([JSON.stringify(safe, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selected.referenceNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!authed) {
    return (
      <form onSubmit={login} className="mx-auto max-w-md card-light space-y-4 p-6">
        <h1 className="font-display text-3xl text-espresso">Admin sign in</h1>
        <p className="text-sm text-warmgrey">
          Booking dashboard is private. Set ADMIN_PASSWORD in your environment.
        </p>
        <input
          type="password"
          className="input-light"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          required
        />
        {error && <p className="text-sm text-burgundy">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          Sign in
        </button>
      </form>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-espresso">
            Booking dashboard
          </h1>
          <p className="mt-1 text-sm text-warmgrey">
            Identity documents are never stored or displayed here.
          </p>
        </div>
        <button type="button" className="btn-secondary" onClick={logout}>
          Sign out
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="card-light overflow-hidden">
          <ul className="divide-y divide-border">
            {bookings.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  className={`w-full px-4 py-4 text-left transition hover:bg-champagne/50 ${
                    selectedId === b.id ? "bg-blush/40" : ""
                  }`}
                  onClick={() => setSelectedId(b.id)}
                >
                  <p className="font-medium text-espresso">
                    {b.referenceNumber}
                  </p>
                  <p className="text-sm text-warmgrey">
                    {b.preferredName || b.fullName} · {b.serviceName}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted">
                    {b.enquiryStatus}
                    {b.blocked ? " · Blocked" : ""}
                  </p>
                </button>
              </li>
            ))}
            {!bookings.length && (
              <li className="px-4 py-8 text-sm text-warmgrey">
                No enquiries yet.
              </li>
            )}
          </ul>
        </div>

        {selected ? (
          <div className="card-light space-y-4 p-5">
            <div>
              <p className="text-eyebrow">{selected.referenceNumber}</p>
              <h2 className="mt-1 font-display text-2xl text-espresso">
                {selected.preferredName || selected.fullName}
              </h2>
              <p className="text-sm text-warmgrey">
                {selected.email} · {selected.mobile}
              </p>
            </div>

            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <Item label="Service" value={selected.serviceName} />
              <Item label="Date" value={selected.preferredDate} />
              <Item label="Alternative" value={selected.alternativeDate || "—"} />
              <Item label="Window" value={selected.timeWindow || "—"} />
              <Item label="Duration" value={selected.requestedDuration} />
              <Item label="City" value={`${selected.city}, ${selected.country}`} />
              <Item label="Venue" value={selected.venueType} />
              <Item label="Created" value={new Date(selected.createdAt).toLocaleString()} />
            </dl>

            <p className="text-sm text-warmgrey">
              <span className="font-medium text-espresso">Purpose: </span>
              {selected.purpose}
            </p>
            {selected.additionalNotes && (
              <p className="text-sm text-warmgrey">
                <span className="font-medium text-espresso">Notes: </span>
                {selected.additionalNotes}
              </p>
            )}

            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Enquiry status</span>
              <select
                className="input-light"
                value={selected.enquiryStatus}
                onChange={(e) =>
                  void savePatch({
                    enquiryStatus: e.target.value as BookingEnquiry["enquiryStatus"],
                  })
                }
              >
                {enquiryStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">
                Verification status
              </span>
              <select
                className="input-light"
                value={selected.verificationStatus}
                onChange={(e) =>
                  void savePatch({
                    verificationStatus: e.target
                      .value as BookingEnquiry["verificationStatus"],
                  })
                }
              >
                {verificationStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Deposit status</span>
              <select
                className="input-light"
                value={selected.depositStatus}
                onChange={(e) =>
                  void savePatch({
                    depositStatus: e.target.value as BookingEnquiry["depositStatus"],
                  })
                }
              >
                {depositStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Internal notes</span>
              <textarea
                className="input-light min-h-28"
                defaultValue={selected.internalNotes}
                onBlur={(e) => void savePatch({ internalNotes: e.target.value })}
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  void savePatch({
                    enquiryStatus: "Awaiting information",
                    internalNotes: `${selected.internalNotes}\n[${new Date().toISOString()}] Requested more information.`,
                  })
                }
              >
                Request more info
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  void savePatch({
                    enquiryStatus: "Confirmed",
                    internalNotes: `${selected.internalNotes}\n[${new Date().toISOString()}] Confirmation template noted.`,
                  })
                }
              >
                Mark confirmation sent
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => void savePatch({ blocked: !selected.blocked })}
              >
                {selected.blocked ? "Unblock" : "Block enquiry"}
              </button>
              <button type="button" className="btn-secondary" onClick={exportSelected}>
                Export (no ID docs)
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => void removeSelected()}
              >
                Delete personal data
              </button>
            </div>
            {error && <p className="text-sm text-burgundy">{error}</p>}
          </div>
        ) : (
          <div className="card-light p-6 text-sm text-warmgrey">
            Select an enquiry to review.
          </div>
        )}
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.12em] text-muted">{label}</dt>
      <dd className="text-espresso">{value}</dd>
    </div>
  );
}
