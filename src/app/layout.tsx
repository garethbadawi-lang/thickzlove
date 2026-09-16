import type { Metadata } from "next";
import { Bodoni_Moda, Manrope, Parisienne } from "next/font/google";
import { AgeGate } from "@/components/AgeGate";
import { LightHeader } from "@/components/LightHeader";
import { LightFooter } from "@/components/LightFooter";
import { siteConfig } from "@/data/site-config";
import { getPublicSocials, getSiteContent } from "@/lib/public-content";
import "./globals.css";

export const dynamic = "force-dynamic";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

const script = Parisienne({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-parisienne",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.seo.siteUrl),
  title: {
    default: siteConfig.seo.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.seo.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  keywords: [
    "Love Z Thick",
    "ZLOVE_theGOAT",
    "Thickzlove912",
    "adult entertainer",
    "content creator",
    "Atlanta",
  ],
  robots: siteConfig.seo.noindex
    ? { index: false, follow: false }
    : { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: siteConfig.seo.locale,
    url: siteConfig.seo.siteUrl,
    siteName: siteConfig.name,
    title: siteConfig.seo.ogTitle,
    description: siteConfig.seo.ogDescription,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — Official Website`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seo.ogTitle,
    description: siteConfig.seo.ogDescription,
    images: [siteConfig.ogImage],
    creator: siteConfig.username,
  },
  alternates: {
    canonical: siteConfig.seo.siteUrl,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [content, socials] = await Promise.all([
    getSiteContent(),
    getPublicSocials(),
  ]);

  const mainCta = {
    label: content.homepage.mainCtaLabel,
    href: content.homepage.mainCtaHref,
  };

  const showAnnouncement =
    content.homepage.announcementEnabled &&
    Boolean(content.homepage.announcementText.trim());

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    alternateName: siteConfig.username,
    url: siteConfig.seo.siteUrl,
    description: siteConfig.seo.description,
    sameAs: socials.map((s) => s.url),
  };

  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${script.variable}`}
    >
      <body className="font-body bg-ivory text-espresso">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AgeGate />
        {showAnnouncement && (
          <div className="bg-champagne px-4 py-2 text-center text-sm text-burgundy">
            {content.homepage.announcementText}
          </div>
        )}
        <LightHeader mainCta={mainCta} />
        <main className="relative min-h-[70vh]">{children}</main>
        <LightFooter
          socials={socials}
          footerMessage={content.settings.footerMessage}
        />
      </body>
    </html>
  );
}
