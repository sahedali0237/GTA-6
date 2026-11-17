"use client";

import { useEffect } from "react";

import { CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdSlotProps = {
  id: string;
  size: "leaderboard" | "rectangle";
};

const SIZES: Record<AdSlotProps["size"], { label: string; className: string }> = {
  // NOTE: Fixed reserved heights per spec §4.4/§7 to avoid layout shift (CLS).
  leaderboard: { label: "Leaderboard", className: "h-[100px] w-full max-w-[728px] sm:h-[90px]" },
  rectangle: { label: "Rectangle", className: "h-[250px] w-full max-w-[300px]" },
};

export function AdSlot({ id, size }: AdSlotProps) {
  const adsEnabled = CONFIG.ADS_ENABLED && CONFIG.ADSENSE_CLIENT_ID !== "";
  const showPlaceholder =
    process.env.NEXT_PUBLIC_SHOW_AD_PLACEHOLDERS === "true" ||
    process.env.NODE_ENV === "development";

  useEffect(() => {
    if (!adsEnabled) return;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // Ad blockers or a blocked script make the push fail — safe to ignore.
    }
  }, [adsEnabled, id]);

  return (
    <div className="flex flex-col items-center gap-1 px-4 py-6 sm:px-6" aria-label="Advertisement">
      <span className="text-[10px] uppercase tracking-widest text-muted">Advertisement</span>
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-lg",
          SIZES[size].className,
        )}
      >
        {adsEnabled ? (
          <ins
            className="adsbygoogle block h-full w-full"
            data-ad-client={CONFIG.ADSENSE_CLIENT_ID}
            data-ad-slot={id}
            data-full-width-responsive="true"
          />
        ) : showPlaceholder ? (
          <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-border bg-surface/50 text-xs text-muted">
            Ad slot ({SIZES[size].label}) — {id}
          </div>
        ) : null}
      </div>
    </div>
  );
}
