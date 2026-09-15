import type { Metadata } from "next";
import { Bodoni_Moda, Manrope, Parisienne } from "next/font/google";
import { AgeGate } from "@/components/AgeGate";
import { LightHeader } from "@/components/LightHeader";
import { LightFooter } from "@/components/LightFooter";
import { siteConfig } from "@/data/site-config";
import { getEnabledSocials } from "@/data/socials";
import "./globals.css";

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

const sameAs = getEnabledSocials().map((s) => s.url);

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteConfig.name,
  alternateName: siteConfig.username,
  url: siteConfig.seo.siteUrl,
  description: siteConfig.seo.description,
  sameAs,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <LightHeader />
        <main className="relative min-h-[70vh]">{children}</main>
        <LightFooter />
      </body>
    </html>
  );
}
