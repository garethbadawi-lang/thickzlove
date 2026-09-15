import { cn } from "@/lib/utils";

const steps = [
  "Your details",
  "Experience",
  "Arrangement",
  "Confirmation",
];

interface BookingProgressProps {
  currentStep: number;
}

export function BookingProgress({ currentStep }: BookingProgressProps) {
  return (
    <ol className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {steps.map((label, index) => {
        const step = index + 1;
        const active = step === currentStep;
        const done = step < currentStep;
        return (
          <li
            key={label}
            className={cn(
              "rounded-2xl border px-3 py-3 text-center",
              active
                ? "border-burgundy bg-blush/40"
                : done
                  ? "border-gold/50 bg-white"
                  : "border-border bg-white",
            )}
          >
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-warmgrey">
              Step {step}
            </span>
            <span
              className={cn(
                "mt-1 block text-sm font-medium",
                active ? "text-burgundy" : "text-espresso",
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
