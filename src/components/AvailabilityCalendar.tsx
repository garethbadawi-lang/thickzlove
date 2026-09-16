"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  type AvailabilityDay,
  type AvailabilityStatus,
  type TimeWindow,
} from "@/data/availability";
import type { CompanionService } from "@/data/services";
import { cn, formatDisplayDate } from "@/lib/utils";
import { TimeWindowSelect } from "./TimeWindowSelect";
import Link from "next/link";

const statusStyles: Record<AvailabilityStatus, string> = {
  available: "border-available/70 bg-white text-espresso hover:bg-available/10",
  limited: "border-gold bg-champagne/60 text-espresso hover:bg-champagne",
  unavailable: "border-border bg-champagne/30 text-muted cursor-not-allowed",
  enquire: "border-rose/50 bg-blush/30 text-espresso hover:bg-blush/50",
};

function monthKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function AvailabilityCalendar({
  days,
  services,
}: {
  days: AvailabilityDay[];
  services: CompanionService[];
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState("");
  const [serviceId, setServiceId] = useState("");

  const byDate = useMemo(() => {
    const map = new Map(days.map((d) => [d.date, d]));
    return map;
  }, [days]);

  const selected = selectedDate ? byDate.get(selectedDate) : undefined;

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  }

  const firstDow = new Date(year, month, 1).getDay();
  const total = daysInMonth(year, month);
  const blanks = Array.from({ length: firstDow });
  const dayNumbers = Array.from({ length: total }, (_, i) => i + 1);

  const bookingHref = selectedDate
    ? `/booking?date=${selectedDate}${timeWindow ? `&window=${encodeURIComponent(timeWindow)}` : ""}${serviceId ? `&service=${serviceId}` : ""}`
    : "/booking";

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="card-light p-4 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={prevMonth}
            className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-white"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-5" />
          </button>
          <h2 className="font-display text-2xl text-espresso">
            {new Date(year, month, 1).toLocaleString("en-GB", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button
            type="button"
            onClick={nextMonth}
            className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-white"
            aria-label="Next month"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-warmgrey">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {blanks.map((_, i) => (
            <div key={`b-${i}`} />
          ))}
          {dayNumbers.map((day) => {
            const iso = `${monthKey(year, month)}-${String(day).padStart(2, "0")}`;
            const entry = byDate.get(iso);
            const status = entry?.enabled ? entry.status : "unavailable";
            const selectable =
              entry?.enabled &&
              (status === "available" ||
                status === "limited" ||
                status === "enquire");
            const isSelected = selectedDate === iso;

            return (
              <button
                key={iso}
                type="button"
                disabled={!selectable}
                onClick={() => {
                  setSelectedDate(iso);
                  setTimeWindow("");
                }}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center rounded-xl border text-sm transition",
                  isSelected
                    ? "border-burgundy bg-burgundy text-white"
                    : statusStyles[status],
                )}
                aria-pressed={isSelected}
                aria-label={`${iso}, ${status}`}
              >
                <span className="font-medium">{day}</span>
              </button>
            );
          })}
        </div>

        <ul className="mt-6 flex flex-wrap gap-3 text-xs text-warmgrey">
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-full border-2 border-available" /> Available
          </li>
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-full border-2 border-gold bg-champagne" /> Limited
          </li>
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-full border-2 border-border bg-champagne/40" /> Unavailable
          </li>
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-full border-2 border-rose bg-blush" /> Enquire
          </li>
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-burgundy" /> Selected
          </li>
        </ul>
      </div>

      <aside className="card-light p-5 sm:p-6">
        <h3 className="font-display text-2xl text-espresso">Selected date</h3>
        {selectedDate && selected ? (
          <>
            <p className="mt-2 text-sm text-warmgrey">
              {formatDisplayDate(selectedDate)}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">
              Status: {selected.status}
            </p>

            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-espresso">
                Time window
              </p>
              <TimeWindowSelect
                windows={(selected.availableWindows || []) as TimeWindow[]}
                value={timeWindow}
                onChange={setTimeWindow}
              />
            </div>

            <div className="mt-6">
              <label
                htmlFor="calendar-service"
                className="mb-2 block text-sm font-medium text-espresso"
              >
                Service
              </label>
              <select
                id="calendar-service"
                className="input-light"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
              >
                <option value="">Choose a service</option>
                {services
                  .filter(
                    (s) =>
                      !selected.allowedServices ||
                      selected.allowedServices.includes(s.id),
                  )
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>

            <Link href={bookingHref} className="btn-primary mt-8 w-full">
              Continue to Booking
            </Link>
          </>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-warmgrey">
            Select an available date to choose a time window and continue to the
            enquiry form. Exact appointment times and other clients are never
            shown.
          </p>
        )}
      </aside>
    </div>
  );
}
