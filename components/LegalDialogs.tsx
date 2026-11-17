"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CONFIG } from "@/lib/config";

function PrivacyDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-sm text-muted underline-offset-4 transition-colors hover:text-text hover:underline"
        >
          Privacy Policy
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
          <DialogDescription>How this website handles your data.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm leading-relaxed text-muted">
          <p>
            We set <strong>no first-party cookies</strong>. The app uses only your browser&apos;s
            localStorage and sessionStorage (daily question quota and the current chat) — this data
            never leaves your device.
          </p>
          <p>
            <strong>Your chat is not stored on our servers.</strong> When you ask a question, the
            message is sent to a third-party AI provider (OpenRouter) to generate an answer. OpenRouter
            and the underlying model provider process the message under their own privacy policies.
          </p>
          <p>
            If Google Analytics and AdSense are enabled, <strong>GA/AdSense may set cookies</strong> to
            measure traffic and show ads. You can block them with any ad blocker or your browser settings.
          </p>
          <p>
            The newsletter form sends your email address directly to our newsletter provider. We never
            see or store it on this website&apos;s servers.
          </p>
          <p>Questions? Email us at {CONFIG.CONTACT_EMAIL}.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AffiliateDisclosureDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-sm text-muted underline-offset-4 transition-colors hover:text-text hover:underline"
        >
          Affiliate Disclosure
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Affiliate Disclosure</DialogTitle>
          <DialogDescription>How this website is funded.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm leading-relaxed text-muted">
          <p>
            As an Amazon Associate and partner of other programs, we earn from qualifying purchases at
            no extra cost to you.
          </p>
          <p>
            Some links in the &quot;Get Ready for GTA 6&quot; section are affiliate links. If you click one and
            make a purchase, we may receive a small commission. This never affects the price you pay
            or our recommendations.
          </p>
          <p>
            This website is also funded by donations and advertising. It remains fully independent and
            unofficial.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function LegalDialogs() {
  // Local state is not needed; Radix Dialog handles open/close, focus trapping
  // and keyboard (Esc) dismissal out of the box.
  return (
    <>
      <PrivacyDialog />
      <AffiliateDisclosureDialog />
    </>
  );
}
