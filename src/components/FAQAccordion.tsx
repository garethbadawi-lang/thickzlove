"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/data/faqs";
import { cn } from "@/lib/utils";

export function FAQAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {faqs.map((faq) => {
        const open = openId === faq.id;
        return (
          <div key={faq.id} className="card-light overflow-hidden">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : faq.id)}
            >
              <span className="font-medium text-espresso">{faq.question}</span>
              <ChevronDown
                className={cn(
                  "size-5 shrink-0 text-burgundy transition",
                  open && "rotate-180",
                )}
              />
            </button>
            {open && (
              <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-warmgrey">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
