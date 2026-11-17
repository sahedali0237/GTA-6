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
  alternates: { canonical: "/" },
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
      <body
        className={`${bebas.variable} ${inter.variable} bg-bg text-text antialiased`}
      >
        <Navbar />

        <ClientLayout>{children}</ClientLayout>
        <Footer />

        <Toaster position="bottom-right" />

        {CONFIG.GA4_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${CONFIG.GA4_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${CONFIG.GA4_ID}', { anonymize_ip: true });
              `}
            </Script>
          </>
        ) : null}

        
        {CONFIG.ADS_ENABLED && CONFIG.ADSENSE_CLIENT_ID ? (
          <Script
            id="adsense-init"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CONFIG.ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        ) : null}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </body>
    </html>
  );
}