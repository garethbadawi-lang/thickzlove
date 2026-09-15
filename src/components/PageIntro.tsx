interface PageIntroProps {
  eyebrow?: string;
  heading: string;
  scriptSubtitle?: string;
  children?: React.ReactNode;
}

export function PageIntro({
  eyebrow,
  heading,
  scriptSubtitle,
  children,
}: PageIntroProps) {
  return (
    <header className="mx-auto max-w-3xl px-4 pb-10 pt-12 text-center sm:px-6 sm:pt-16">
      {eyebrow && <p className="text-eyebrow mb-3">{eyebrow}</p>}
      <h1 className="font-display text-4xl text-espresso sm:text-5xl">
        {heading}
      </h1>
      {scriptSubtitle && (
        <p className="mt-4 font-script text-[1.75rem] text-burgundy sm:text-3xl">
          {scriptSubtitle}
        </p>
      )}
      {children && (
        <div className="mt-5 text-base leading-relaxed text-warmgrey">
          {children}
        </div>
      )}
    </header>
  );
}
