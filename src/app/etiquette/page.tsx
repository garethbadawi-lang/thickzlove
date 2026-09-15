import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { EtiquetteSection } from "@/components/EtiquetteSection";
import { etiquetteCopy, etiquetteSections } from "@/data/etiquette";

export const metadata: Metadata = {
  title: "Etiquette",
  description:
    "Etiquette and expectations for arrangements with Miss Juicy Staxxx.",
};

export default function EtiquettePage() {
  return (
    <>
      <PageIntro heading={etiquetteCopy.heading} />
      <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        {etiquetteSections
          .slice()
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((section) => (
            <EtiquetteSection key={section.id} section={section} />
          ))}
        <aside className="mt-10 rounded-[18px] border border-border bg-blush/40 p-6">
          <p className="text-sm leading-relaxed text-espresso">
            {etiquetteCopy.disclaimer}
          </p>
        </aside>
      </div>
    </>
  );
}
