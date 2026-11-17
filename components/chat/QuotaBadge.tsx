"use client";

import { CONFIG } from "@/lib/config";

export function QuotaBadge({ remaining }: { remaining: number }) {
  return (
    <span
      role="status"
      aria-label={`Questions left today: ${remaining} of ${CONFIG.DAILY_LIMIT}`}
      className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-muted"
    >
      Questions left today: {remaining} / {CONFIG.DAILY_LIMIT}
    </span>
  );
}
