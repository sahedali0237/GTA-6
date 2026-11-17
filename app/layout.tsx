import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import Script from "next/script";

import { ClientLayout } from "@/components/ClientLayout";
import { Footer } from "@/components/Footer";
import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { CONFIG } from "@/lib/config";

import "./globals.css";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const META_DESCRIPTION =
  "Ask anything about GTA 6 with a free AI assistant. Honest answers on the release date, map, characters and platforms — from confirmed facts only.";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: CONFIG.SITE_NAME,
  url: CONFIG.SITE_URL,
};

export const metadata: Metadata = {
  metadataBase: new URL(CONFIG.SITE_URL),

  title:
    "GTA 6 AI Assistant – Ask Anything About Grand Theft Auto VI (Release Date, Map, Characters)",

  description: META_DESCRIPTION,

  alternates: {
    canonical: "/",
  },

  // Google AdSense site verification — must be in <head> for the crawler.
  other: {
    "google-adsense-account": "ca-pub-7862857287477025",
  },

  openGraph: {
    title: "GTA 6 AI Assistant – Ask Anything About Grand Theft Auto VI",
    description: META_DESCRIPTION,
    url: "/",
    siteName: CONFIG.SITE_NAME,
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "GTA 6 AI Assistant – Ask Anything About Grand Theft Auto VI",
    description: META_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0f",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          AdSense verification: use a plain <script> tag (not Next.js <Script>)
          so it appears in the SSR HTML that the Google crawler reads.
          The google-adsense-account meta is declared in the metadata export above.
        */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7862857287477025"
          crossOrigin="anonymous"
        />
      </head>

      <body
        className={`${bebas.variable} ${inter.variable} bg-bg text-text antialiased`}
      >
        <Navbar />

        <ClientLayout>{children}</ClientLayout>

        <Footer />

        <Toaster position="bottom-right" />

        {/* Google Analytics */}
        {CONFIG.GA4_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${CONFIG.GA4_ID}`}
              strategy="afterInteractive"
            />

            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];

                function gtag() {
                  dataLayer.push(arguments);
                }

                gtag('js', new Date());

                gtag('config', '${CONFIG.GA4_ID}', {
                  anonymize_ip: true
                });
              `}
            </Script>
          </>
        ) : null}

        {/* Website structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
      </body>
    </html>
  );
}
