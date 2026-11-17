import { Coffee } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CONFIG } from "@/lib/config";

export function Donation() {
  return (
    <section
      aria-labelledby="donation-heading"
      className="mx-auto w-full max-w-275 px-4 py-12 sm:px-6"
    >
      <div className="mx-auto max-w-190 rounded-2xl border border-border bg-surface p-6 text-center sm:p-10">
        <h2
          id="donation-heading"
          className="font-display text-3xl tracking-wide text-text sm:text-4xl"
        >
          Support the <span className="text-gradient">project</span>
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted sm:text-base">
          This AI runs on paid servers. If it helped you, buy me a coffee ☕
        </p>
        <Button asChild size="lg" className="mt-6">
          <a
            href={CONFIG.DONATION_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Coffee className="h-5 w-5" aria-hidden="true" />
            Buy me a coffee
          </a>
        </Button>
      </div>
    </section>
  );
}
