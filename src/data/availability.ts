export type AvailabilityStatus =
  | "available"
  | "limited"
  | "unavailable"
  | "enquire";

export type TimeWindow =
  | "Daytime"
  | "Early evening"
  | "Evening"
  | "Late evening"
  | "Flexible";

export interface AvailabilityDay {
  date: string; // YYYY-MM-DD
  status: AvailabilityStatus;
  availableWindows: TimeWindow[];
  notes?: string;
  minimumDuration?: string;
  allowedServices?: string[];
  enabled: boolean;
}

export const availabilityCopy = {
  heading: "Availability",
  scriptSubtitle: "Find a time that works beautifully.",
  notice:
    "Calendar availability is indicative and does not guarantee acceptance or confirmation.",
} as const;

/** Indicative sample dates — edit freely. No client details are exposed. */
export const availability: AvailabilityDay[] = generateSampleAvailability();

function generateSampleAvailability(): AvailabilityDay[] {
  const days: AvailabilityDay[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  for (let i = 1; i <= 60; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const weekday = d.getDay();

    if (weekday === 0 || weekday === 1) {
      days.push({
        date: iso,
        status: "unavailable",
        availableWindows: [],
        enabled: true,
      });
      continue;
    }

    if (weekday === 5 || weekday === 6) {
      days.push({
        date: iso,
        status: "limited",
        availableWindows: ["Evening", "Late evening"],
        notes: "Limited evening windows",
        allowedServices: [
          "private-dinner",
          "evening-engagement",
          "city-date",
          "extended-evening",
        ],
        enabled: true,
      });
      continue;
    }

    days.push({
      date: iso,
      status: i % 7 === 3 ? "enquire" : "available",
      availableWindows: ["Daytime", "Early evening", "Evening", "Flexible"],
      enabled: true,
    });
  }

  return days;
}

export function getAvailabilityByDate(date: string) {
  return availability.find((d) => d.enabled && d.date === date);
}

export function getUpcomingAvailable(limit = 5) {
  return availability
    .filter(
      (d) =>
        d.enabled &&
        (d.status === "available" || d.status === "limited" || d.status === "enquire"),
    )
    .slice(0, limit);
}
