import type { VerificationStatus } from "@/lib/booking-types";
import { siteConfig } from "@/data/site-config";
import { cn } from "@/lib/utils";

interface VerificationStatusProps {
  status?: VerificationStatus;
  showAdminLabel?: boolean;
  onBegin?: () => void;
}

const statusTone: Record<VerificationStatus, string> = {
  "Not requested": "border-border bg-white text-warmgrey",
  "Verification requested": "border-gold bg-champagne text-espresso",
  "Verification in progress": "border-rose bg-blush/40 text-espresso",
  Verified: "border-available bg-white text-available",
  Rejected: "border-burgundy bg-blush/30 text-burgundy",
  Expired: "border-muted bg-champagne/50 text-muted",
};

export function VerificationStatusBadge({
  status = "Not requested",
  showAdminLabel,
  onBegin,
}: VerificationStatusProps) {
  return (
    <div className="rounded-[18px] border border-border bg-champagne/50 p-6">
      <h3 className="font-display text-2xl text-espresso">
        {siteConfig.verification.heading}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-warmgrey">
        {siteConfig.verification.copy}
      </p>
      <p className="mt-3 text-xs leading-relaxed text-warmgrey">
        {siteConfig.verification.note}
      </p>

      {showAdminLabel && (
        <p
          className={cn(
            "mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]",
            statusTone[status],
          )}
        >
          {status}
        </p>
      )}

      <button
        type="button"
        onClick={onBegin}
        className="btn-secondary mt-6"
        disabled={!onBegin}
      >
        {siteConfig.verification.buttonLabel}
      </button>
    </div>
  );
}
