"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminSaveBar,
  saveContentSection,
} from "@/components/admin/AdminSaveBar";
import type { CompanionService } from "@/data/services";

export function AdminServicesEditor() {
  const router = useRouter();
  const [services, setServices] = useState<CompanionService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/content");
        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }
        if (!res.ok) throw new Error("Unable to load services.");
        const data = (await res.json()) as {
          content: { services: CompanionService[] };
        };
        setServices(
          [...(data.content.services || [])].sort(
            (a, b) => a.displayOrder - b.displayOrder,
          ),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) return <p className="text-sm text-warmgrey">Loading services…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-espresso">Services</h1>
        <p className="mt-2 text-sm text-warmgrey">
          Edit names, descriptions, rates and visibility. Layout stays fixed.
        </p>
        {error && <p className="mt-2 text-sm text-burgundy">{error}</p>}
      </div>

      <ul className="space-y-4">
        {services.map((service, index) => (
          <li key={service.id} className="card-light space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">
                {service.id}
              </p>
              <div className="flex gap-4 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={service.featured}
                    onChange={(e) =>
                      setServices((prev) =>
                        prev.map((s, i) =>
                          i === index ? { ...s, featured: e.target.checked } : s,
                        ),
                      )
                    }
                  />
                  Featured
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={service.enabled}
                    onChange={(e) =>
                      setServices((prev) =>
                        prev.map((s, i) =>
                          i === index ? { ...s, enabled: e.target.checked } : s,
                        ),
                      )
                    }
                  />
                  Visible
                </label>
              </div>
            </div>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Name</span>
              <input
                className="input-light"
                value={service.name}
                onChange={(e) =>
                  setServices((prev) =>
                    prev.map((s, i) =>
                      i === index ? { ...s, name: e.target.value } : s,
                    ),
                  )
                }
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Description</span>
              <textarea
                className="input-light min-h-24"
                value={service.description}
                onChange={(e) =>
                  setServices((prev) =>
                    prev.map((s, i) =>
                      i === index ? { ...s, description: e.target.value } : s,
                    ),
                  )
                }
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Duration</span>
                <input
                  className="input-light"
                  value={service.duration}
                  onChange={(e) =>
                    setServices((prev) =>
                      prev.map((s, i) =>
                        i === index ? { ...s, duration: e.target.value } : s,
                      ),
                    )
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Price label</span>
                <input
                  className="input-light"
                  value={service.priceLabel}
                  onChange={(e) =>
                    setServices((prev) =>
                      prev.map((s, i) =>
                        i === index ? { ...s, priceLabel: e.target.value } : s,
                      ),
                    )
                  }
                />
              </label>
            </div>
          </li>
        ))}
      </ul>

      <AdminSaveBar
        onSave={async () => {
          const normalized = services.map((s, index) => ({
            ...s,
            displayOrder: index + 1,
          }));
          await saveContentSection("services", normalized);
          setServices(normalized);
        }}
      />
    </div>
  );
}
