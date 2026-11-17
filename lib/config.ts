export const CONFIG = {
  SITE_URL: "https://example.com",
  SITE_NAME: "GTA6 AI",
  RELEASE_DATE: "2026-11-19T00:00:00Z",
  DAILY_LIMIT: Number(process.env.NEXT_PUBLIC_DAILY_LIMIT ?? 10),
  DEFAULT_MODEL: "openai/gpt-4o-mini",
  FALLBACK_MODELS: ["google/gemini-2.0-flash-001", "meta-llama/llama-3.3-70b-instruct"],
  DONATION_URL: "https://buymeacoffee.com/work.sahed.1st",
  NEWSLETTER_ACTION_URL: "https://formspree.io/f/xxxx",
  CONTACT_EMAIL: "hello@example.com",
  TRAILER_YOUTUBE_ID: "QdBZY2fkU-0",
  GA4_ID: process.env.NEXT_PUBLIC_GA4_ID ?? "",
  ADS_ENABLED: process.env.NEXT_PUBLIC_ADS_ENABLED === "true",
  ADSENSE_CLIENT_ID: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "",
  SUGGESTED_QUESTIONS: [
    "When is the GTA 6 release date?",
    "Will GTA 6 come to PC?",
    "Who are Lucia and Jason?",
    "How big is the GTA 6 map?",
  ],
  AFFILIATE_PRODUCTS: [
    { title: "PlayStation 5", desc: "The launch platform for GTA 6.", img: "/img/ps5.svg", url: "https://amzn.to/xxxx" },
    { title: "Xbox Series X", desc: "4K-ready for Leonida.", img: "/img/xsx.svg", url: "https://amzn.to/xxxx" },
    { title: "4K 120Hz Gaming Monitor", desc: "See Vice City in full glory.", img: "/img/monitor.svg", url: "https://amzn.to/xxxx" },
    { title: "GTA V (discounted)", desc: "Catch up before GTA 6.", img: "/img/gta5.svg", url: "https://www.cdkeys.com/?mw_aref=xxxx" },
  ],
} as const;

export type AffiliateProduct = (typeof CONFIG.AFFILIATE_PRODUCTS)[number];
