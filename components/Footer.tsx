import { LegalDialogs } from "@/components/LegalDialogs";
import { CONFIG } from "@/lib/config";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-surface/50">
      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6">
        <p className="max-w-3xl text-xs leading-relaxed text-muted">
          This is an unofficial fan-made website and is not affiliated with, endorsed by, or connected
          to Rockstar Games, Take-Two Interactive, or any of their subsidiaries. Grand Theft Auto and
          GTA are trademarks of Take-Two Interactive Software, Inc. AI answers may contain errors —
          always verify with official sources.
        </p>
        <p className="mt-3 max-w-3xl text-xs leading-relaxed text-muted">
          As an Amazon Associate and partner of other programs, we earn from qualifying purchases at
          no extra cost to you.
        </p>
        <nav aria-label="Legal and contact" className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <LegalDialogs />
          <a
            href={`mailto:${CONFIG.CONTACT_EMAIL}`}
            className="text-sm text-muted underline-offset-4 transition-colors hover:text-text hover:underline"
          >
            Contact
          </a>
        </nav>
        <p className="mt-6 font-display text-xl tracking-wide text-text">
          <span className="text-gradient">GTA6</span> AI
        </p>
      </div>
    </footer>
  );
}
