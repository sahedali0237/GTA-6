import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CONFIG } from "@/lib/config";
import { SignInForm } from "./SignInForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  alternates: { canonical: "/sign-in" },
  robots: { index: false, follow: true },
};

const HIGHLIGHTS = [
  {
    num: "01.",
    title: "Confirmed Release Intel",
    detail:
      "Verified Grand Theft Auto VI launch timing, console platforms, and official trailer details.",
  },
  {
    num: "02.",
    title: "Rumors Clearly Labeled",
    detail:
      "Every answer separates Rockstar Games announcements from unconfirmed community speculation.",
  },
  {
    num: "03.",
    title: "Fast Leonida Q&A",
    detail:
      "Ask about Vice City locations, Lucia and Jason, gameplay systems, or hardware upgrades.",
  },
] as const;

export default function SignInPage() {
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );

  return (
    <section className="relative isolate overflow-hidden px-4 py-10 sm:px-6 sm:py-16">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-30"
        style={{
          background:
            "radial-gradient(55% 45% at 25% 15%, var(--accent-from) 0%, transparent 65%), radial-gradient(45% 40% at 80% 25%, var(--accent-to) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-text whitespace-nowrap"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to {CONFIG.SITE_NAME}
          </Link>
        </div>

        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-6 lg:col-span-6">
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted">
                <span>{CONFIG.SITE_NAME}</span>
                <span className="mx-2" aria-hidden="true">
                  ·
                </span>
                <span>Confirmed Facts Only</span>
              </p>

              <h1 className="max-w-lg text-balance font-display text-4xl leading-[1.05] tracking-wide text-text sm:text-5xl lg:text-6xl">
                Return to the{" "}
                <span className="text-gradient">Leonida Briefing</span>
              </h1>

              <p className="max-w-md text-base leading-relaxed text-muted">
                Sign in to pick up your GTA 6 research, explore verified map and
                character details, and stay ready for launch day.
              </p>
            </div>

            <div className="divide-y divide-border/70 border-t border-border/70 pt-2">
              {HIGHLIGHTS.map((item) => (
                <div key={item.num} className="py-4">
                  <h2 className="text-sm font-semibold text-text">
                    <span className="mr-2 text-accent-to tabular-nums">
                      {item.num}
                    </span>
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="mx-auto w-full max-w-md lg:ml-auto lg:mr-0">
              <SignInForm googleEnabled={googleEnabled} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
