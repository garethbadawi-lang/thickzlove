"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminSaveBar,
  saveContentSection,
} from "@/components/admin/AdminSaveBar";
import type { FaqItem } from "@/data/faqs";

export function AdminFaqEditor() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
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
        if (!res.ok) throw new Error("Unable to load FAQs.");
        const data = (await res.json()) as { content: { faqs: FaqItem[] } };
        setFaqs(
          [...(data.content.faqs || [])].sort(
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

  function move(id: string, dir: -1 | 1) {
    setFaqs((prev) => {
      const sorted = [...prev];
      const idx = sorted.findIndex((f) => f.id === id);
      const swap = idx + dir;
      if (idx < 0 || swap < 0 || swap >= sorted.length) return prev;
      const copy = [...sorted];
      const tmp = copy[idx]!;
      copy[idx] = copy[swap]!;
      copy[swap] = tmp;
      return copy;
    });
  }

  if (loading) return <p className="text-sm text-warmgrey">Loading FAQ…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-espresso">FAQ</h1>
          <p className="mt-2 text-sm text-warmgrey">
            Edit, add, remove and reorder public FAQ entries.
          </p>
          {error && <p className="mt-2 text-sm text-burgundy">{error}</p>}
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() =>
            setFaqs((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                question: "New question",
                answer: "New answer",
                enabled: true,
                displayOrder: prev.length + 1,
              },
            ])
          }
        >
          Add FAQ
        </button>
      </div>

      <ul className="space-y-4">
        {faqs.map((faq, index) => (
          <li key={faq.id} className="card-light space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={faq.enabled}
                  onChange={(e) =>
                    setFaqs((prev) =>
                      prev.map((f, i) =>
                        i === index ? { ...f, enabled: e.target.checked } : f,
                      ),
                    )
                  }
                />
                Visible
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => move(faq.id, -1)}
                >
                  Up
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => move(faq.id, 1)}
                >
                  Down
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    if (confirm("Delete this FAQ?")) {
                      setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Question</span>
              <input
                className="input-light"
                value={faq.question}
                onChange={(e) =>
                  setFaqs((prev) =>
                    prev.map((f, i) =>
                      i === index ? { ...f, question: e.target.value } : f,
                    ),
                  )
                }
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Answer</span>
              <textarea
                className="input-light min-h-28"
                value={faq.answer}
                onChange={(e) =>
                  setFaqs((prev) =>
                    prev.map((f, i) =>
                      i === index ? { ...f, answer: e.target.value } : f,
                    ),
                  )
                }
              />
            </label>
          </li>
        ))}
      </ul>

      <AdminSaveBar
        onSave={async () => {
          const normalized = faqs.map((f, index) => ({
            ...f,
            displayOrder: index + 1,
          }));
          await saveContentSection("faqs", normalized);
          setFaqs(normalized);
        }}
      />
    </div>
  );
}
