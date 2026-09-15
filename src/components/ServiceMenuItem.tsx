import Link from "next/link";
import type { CompanionService } from "@/data/services";

interface ServiceMenuItemProps {
  service: CompanionService;
}

export function ServiceMenuItem({ service }: ServiceMenuItemProps) {
  return (
    <article className="border-b border-border py-8 first:pt-0 last:border-b-0">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-8">
        <div className="min-w-0 flex-1">
          <h3 className="font-script text-[1.85rem] leading-tight text-espresso sm:text-[2.1rem]">
            {service.name}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-warmgrey sm:text-base">
            {service.description}
          </p>
          <p className="mt-3 text-sm text-warmgrey md:hidden">
            {service.duration}
          </p>
          <p className="mt-1 font-medium text-espresso md:hidden">
            {service.priceLabel}
          </p>
          <Link
            href={`/booking?service=${service.id}`}
            className="btn-ghost mt-3 inline-flex px-0 text-sm md:mt-4"
          >
            <span className="md:hidden">Enquire</span>
            <span className="hidden md:inline">
              Enquire about this experience
            </span>
          </Link>
        </div>

        <div className="hidden shrink-0 text-right md:block">
          <p className="text-sm text-warmgrey">{service.duration}</p>
          <p className="mt-1 font-display text-xl text-espresso">
            {service.priceLabel.replace("Starting from ", "")}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">
            Starting from
          </p>
        </div>
      </div>
    </article>
  );
}
