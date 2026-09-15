import type { EtiquetteSection as EtiquetteSectionType } from "@/data/etiquette";

export function EtiquetteSection({
  section,
}: {
  section: EtiquetteSectionType;
}) {
  return (
    <article className="border-b border-border py-7 last:border-b-0">
      <h2 className="font-display text-2xl text-espresso">{section.title}</h2>
      <p className="mt-2 max-w-3xl text-base leading-relaxed text-warmgrey">
        {section.body}
      </p>
    </article>
  );
}
