"use client";

import type { TimeWindow } from "@/data/availability";
import { cn } from "@/lib/utils";

interface TimeWindowSelectProps {
  windows: TimeWindow[];
  value: string;
  onChange: (value: string) => void;
}

export function TimeWindowSelect({
  windows,
  value,
  onChange,
}: TimeWindowSelectProps) {
  if (!windows.length) {
    return (
      <p className="text-sm text-warmgrey">
        No public time windows listed for this date. You may still enquire.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Time window">
      {windows.map((window) => (
        <button
          key={window}
          type="button"
          onClick={() => onChange(window)}
          className={cn(
            "min-h-11 rounded-full border px-4 text-sm font-medium transition",
            value === window
              ? "border-burgundy bg-burgundy text-white"
              : "border-border bg-white text-espresso hover:border-gold",
          )}
        >
          {window}
        </button>
      ))}
    </div>
  );
}
