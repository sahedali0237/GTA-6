"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CONFIG, type AffiliateProduct } from "@/lib/config";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// NOTE: GA4_ID is inlined at build time from NEXT_PUBLIC_GA4_ID, so this check
// works on the client. The event only fires when GA is actually enabled (§4.5).
const gaEnabled = CONFIG.GA4_ID !== "";

function fireAffiliateClick(title: string) {
  if (!gaEnabled) return;
  window.gtag?.("event", "affiliate_click", { item: title });
}

function AffiliateCard({ product }: { product: AffiliateProduct }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent-from/50">
      <div className="relative aspect-[4/3] w-full bg-surface-2">
        <Image
          src={product.img}
          alt={product.title}
          width={400}
          height={300}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain p-4"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-base font-semibold text-text">{product.title}</h3>
        <p className="text-sm text-muted">{product.desc}</p>
        <Button asChild size="sm" className="mt-auto w-fit">
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() => fireAffiliateClick(product.title)}
          >
            Check Price
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </Button>
      </div>
    </div>
  );
}

export function AffiliateGrid() {
  return (
    <section aria-labelledby="affiliate-heading" className="mx-auto w-full max-w-[1100px] px-4 py-12 sm:px-6">
      <h2 id="affiliate-heading" className="font-display text-3xl tracking-wide text-text sm:text-4xl">
        Get Ready for <span className="text-gradient">GTA 6</span>
      </h2>
      <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
        Gear up for Leonida. Hand-picked hardware so you are ready on day one.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CONFIG.AFFILIATE_PRODUCTS.map((product) => (
          <AffiliateCard key={product.title} product={product} />
        ))}
      </div>
    </section>
  );
}
