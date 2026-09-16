import type { Metadata } from "next";
import Link from "next/link";
import { readAdminAuditLog, type AdminAuditEntry } from "@/lib/adminAuditLog";

export const metadata: Metadata = {
  title: "Admin Security",
  robots: { index: false, follow: false },
};

function eventLabel(entry: AdminAuditEntry): string {
  switch (entry.event) {
    case "ADMIN_LOGIN_SUCCESS":
      return "Successful login";
    case "ADMIN_LOGIN_FAILED":
      return "Failed login";
    case "ADMIN_LOGOUT":
      return "Logged out";
    case "ADMIN_SESSION_EXPIRED":
      return "Session expired";
    default:
      return entry.event;
  }
}

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function locationLabel(entry: AdminAuditEntry): string {
  if (entry.country && entry.region) return `${entry.country} (${entry.region})`;
  if (entry.country) return entry.country;
  return "Not available";
}

export default async function AdminSecurityPage() {
  const entries = await readAdminAuditLog(200);

  return (
    <div className="bg-ivory py-8">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-eyebrow">Admin</p>
            <h1 className="mt-2 font-display text-3xl text-espresso">
              Security log
            </h1>
            <p className="mt-2 max-w-xl text-sm text-warmgrey">
              Login and logout events for account security monitoring. Passwords
              and session secrets are never stored here.
            </p>
          </div>
          <Link href="/admin" className="btn-secondary">
            Back to dashboard
          </Link>
        </div>

        <ul className="space-y-4">
          {entries.map((entry) => (
            <li key={entry.id} className="card-light p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-display text-lg text-espresso">
                  {formatWhen(entry.timestamp)}
                </p>
                {entry.newIpOrDevice && (
                  <span className="rounded-full bg-blush px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-burgundy">
                    New IP / device
                  </span>
                )}
              </div>
              <p
                className={`mt-1 text-sm font-medium ${
                  entry.success ? "text-available" : "text-burgundy"
                }`}
              >
                {eventLabel(entry)}
              </p>
              <dl className="mt-4 grid gap-2 text-sm text-warmgrey sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-muted">
                    IP
                  </dt>
                  <dd className="text-espresso">{entry.ip}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-muted">
                    Device
                  </dt>
                  <dd className="capitalize text-espresso">{entry.device}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-muted">
                    Browser / OS
                  </dt>
                  <dd className="text-espresso">
                    {entry.browser} / {entry.os}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-muted">
                    Country / region
                  </dt>
                  <dd className="text-espresso">{locationLabel(entry)}</dd>
                </div>
              </dl>
            </li>
          ))}
          {!entries.length && (
            <li className="card-light p-8 text-sm text-warmgrey">
              No security events recorded yet.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
