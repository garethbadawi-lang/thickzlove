import Link from "next/link";

interface BookingCTAProps {
  heading?: string;
  buttonLabel?: string;
  href?: string;
}

export function BookingCTA({
  heading = "Plan Our Time Together",
  buttonLabel = "Begin Your Enquiry",
  href = "/booking",
}: BookingCTAProps) {
  return (
    <section className="bg-blush/50">
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
        <p className="font-script text-3xl text-burgundy sm:text-4xl">
          A private invitation
        </p>
        <h2 className="mt-3 font-display text-3xl text-espresso sm:text-4xl">
          {heading}
        </h2>
        <Link href={href} className="btn-primary mt-8 inline-flex min-w-[14rem]">
          {buttonLabel}
        </Link>
      </div>
    </section>
  );
}
